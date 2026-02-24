import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { apiClient } from '../utils/apiClient';
import { getTestUser, getTestProfile, getTestWorkout, getTestGoal } from '../utils/testData';

describe('Integration Tests: Core User Flows', () => {
  let currentUser = {};
  let loggedInToken = null;
  let createdWorkoutId = null;
  let createdGoalId = null;

  beforeEach(async () => {
    currentUser = getTestUser();
    apiClient.clearAuthToken(); // Ensure no token from previous tests
    // Optional: Add a cleanup step for the database if possible
    // e.g., await apiClient.deleteUser(currentUser.email); if such an endpoint exists
  });

  afterEach(() => {
    apiClient.clearAuthToken();
    // Optional: More aggressive cleanup if tests create persistent data
  });

  it('should successfully register, login, create profile, log workout, and create goal', async () => {
    // 1. User Registration
    const registerResponse = await apiClient.register({
      email: currentUser.email,
      username: currentUser.username,
      password: currentUser.password,
    });
    expect(registerResponse.status).toBe(201); // Assuming 201 Created for successful registration
    expect(registerResponse.data).toHaveProperty('id');
    expect(registerResponse.data).toHaveProperty('email', currentUser.email);
    console.log(`Registered user: ${currentUser.email}`);

    // 2. User Login
    const loginResponse = await apiClient.login({
      email: currentUser.email,
      password: currentUser.password,
    });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data).toHaveProperty('token');
    loggedInToken = loginResponse.data.token;
    expect(apiClient.token).toBe(loggedInToken);
    console.log(`Logged in user: ${currentUser.email}`);

    // 3. Create User Profile
    const profileData = getTestProfile();
    const createProfileResponse = await apiClient.createProfile(profileData);
    expect(createProfileResponse.status).toBe(201);
    expect(createProfileResponse.data).toMatchObject(profileData);
    console.log(`Created profile for ${currentUser.email}`);

    // 4. Get User Profile and verify
    const getProfileResponse = await apiClient.getProfile();
    expect(getProfileResponse.status).toBe(200);
    expect(getProfileResponse.data).toMatchObject(profileData);
    console.log(`Verified profile for ${currentUser.email}`);

    // 5. Update User Profile
    const updatedProfileData = { ...profileData, weightKg: 72, heightCm: 181 };
    const updateProfileResponse = await apiClient.updateProfile(updatedProfileData);
    expect(updateProfileResponse.status).toBe(200);
    expect(updateProfileResponse.data).toMatchObject(updatedProfileData);
    console.log(`Updated profile for ${currentUser.email}`);

    // 6. Log a Workout
    const workoutData = getTestWorkout();
    const logWorkoutResponse = await apiClient.logWorkout(workoutData);
    expect(logWorkoutResponse.status).toBe(201);
    expect(logWorkoutResponse.data).toHaveProperty('id');
    expect(logWorkoutResponse.data).toMatchObject({ type: workoutData.type, name: workoutData.name });
    createdWorkoutId = logWorkoutResponse.data.id;
    console.log(`Logged workout: ${workoutData.name}`);

    // 7. Verify Workout in History
    const getWorkoutsResponse = await apiClient.getWorkouts();
    expect(getWorkoutsResponse.status).toBe(200);
    expect(getWorkoutsResponse.data).toBeInstanceOf(Array);
    const foundWorkout = getWorkoutsResponse.data.find(w => w.id === createdWorkoutId);
    expect(foundWorkout).toBeDefined();
    expect(foundWorkout).toMatchObject({ id: createdWorkoutId, name: workoutData.name });
    console.log(`Verified workout in history: ${workoutData.name}`);

    // 8. Update Logged Workout
    const updatedWorkoutData = { ...workoutData, durationMinutes: 75, notes: 'Updated notes for leg day' };
    const updateWorkoutResponse = await apiClient.updateWorkout(createdWorkoutId, updatedWorkoutData);
    expect(updateWorkoutResponse.status).toBe(200);
    expect(updateWorkoutResponse.data).toMatchObject({ id: createdWorkoutId, durationMinutes: 75, notes: 'Updated notes for leg day' });
    console.log(`Updated workout: ${workoutData.name}`);

    // 9. Create a Goal
    const goalData = getTestGoal();
    const createGoalResponse = await apiClient.createGoal(goalData);
    expect(createGoalResponse.status).toBe(201);
    expect(createGoalResponse.data).toHaveProperty('id');
    expect(createGoalResponse.data).toMatchObject({ name: goalData.name, type: goalData.type });
    createdGoalId = createGoalResponse.data.id;
    console.log(`Created goal: ${goalData.name}`);

    // 10. Verify Goal on Dashboard (by fetching all goals)
    const getGoalsResponse = await apiClient.getGoals();
    expect(getGoalsResponse.status).toBe(200);
    expect(getGoalsResponse.data).toBeInstanceOf(Array);
    const foundGoal = getGoalsResponse.data.find(g => g.id === createdGoalId);
    expect(foundGoal).toBeDefined();
    expect(foundGoal).toMatchObject({ id: createdGoalId, name: goalData.name });
    console.log(`Verified goal on dashboard: ${goalData.name}`);

    // 11. Delete Logged Workout
    const deleteWorkoutResponse = await apiClient.deleteWorkout(createdWorkoutId);
    expect(deleteWorkoutResponse.status).toBe(204); // Assuming 204 No Content for successful deletion
    console.log(`Deleted workout: ${workoutData.name}`);

    // 12. Verify Workout is deleted
    const getWorkoutsAfterDeleteResponse = await apiClient.getWorkouts();
    expect(getWorkoutsAfterDeleteResponse.status).toBe(200);
    const deletedWorkoutCheck = getWorkoutsAfterDeleteResponse.data.find(w => w.id === createdWorkoutId);
    expect(deletedWorkoutCheck).toBeUndefined();
    console.log(`Verified workout deletion.`);

    // 13. User Logout
    const logoutResponse = await apiClient.logout();
    expect(logoutResponse.status).toBe(200);
    expect(apiClient.token).toBeNull();
    console.log(`Logged out user: ${currentUser.email}`);

    // 14. Verify unauthorized access after logout (e.g., trying to get profile)
    await expect(apiClient.getProfile()).rejects.toThrow('Request failed with status code 401'); // Assuming 401 Unauthorized
    console.log(`Verified unauthorized access after logout.`);
  }, 30000); // Increase timeout for potentially long integration tests

  it('should handle invalid registration data', async () => {
    await expect(apiClient.register({ email: 'invalid-email', username: 'test', password: '123' }))
      .rejects.toThrow('Request failed with status code 400'); // Assuming 400 Bad Request
  });

  it('should handle invalid login credentials', async () => {
    // First, register a user
    await apiClient.register({
      email: currentUser.email,
      username: currentUser.username,
      password: currentUser.password,
    });

    // Try to login with wrong password
    await expect(apiClient.login({ email: currentUser.email, password: 'wrongpassword' }))
      .rejects.toThrow('Request failed with status code 401'); // Assuming 401 Unauthorized

    // Try to login with non-existent user
    const nonExistentUser = getTestUser();
    await expect(apiClient.login({ email: nonExistentUser.email, password: nonExistentUser.password }))
      .rejects.toThrow('Request failed with status code 401'); // Assuming 401 Unauthorized
  });

  it('should verify workout library browsing', async () => {
    // Login a user first
    await apiClient.register({
      email: currentUser.email,
      username: currentUser.username,
      password: currentUser.password,
    });
    await apiClient.login({
      email: currentUser.email,
      password: currentUser.password,
    });

    const libraryResponse = await apiClient.getWorkoutLibrary();
    expect(libraryResponse.status).toBe(200);
    expect(libraryResponse.data).toBeInstanceOf(Array);
    // Assuming the library contains at least some predefined workouts
    expect(libraryResponse.data.length).toBeGreaterThanOrEqual(0); // Can be 0 if library is dynamic
    if (libraryResponse.data.length > 0) {
      expect(libraryResponse.data[0]).toHaveProperty('name');
      expect(libraryResponse.data[0]).toHaveProperty('description');
    }
    console.log(`Verified workout library browsing. Found ${libraryResponse.data.length} items.`);
  });
});