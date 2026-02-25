import { test, expect } from '@playwright/test';
import { getTestUser, getTestProfile, getTestWorkout, getTestGoal } from '../utils/testData';
import { apiClient } from '../utils/apiClient';

test.describe('E2E: Workout and Goal Management', () => {
  let user;
  let workoutData;
  let goalData;

  test.beforeEach(async ({ page }) => {
    user = getTestUser();
    workoutData = getTestWorkout();
    goalData = getTestGoal();

    // Pre-register and login the user via API for faster test setup
    await apiClient.register({
      email: user.email,
      username: user.username,
      password: user.password,
    });
    await apiClient.login({
      email: user.email,
      password: user.password,
    });

    // Navigate to the app and ensure login state is reflected
    await page.goto('/');
    await page.getByTestId('login-email-input').fill(user.email);
    await page.getByTestId('login-password-input').fill(user.password);
    await page.getByTestId('login-submit-button').click();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByTestId('welcome-message')).toContainText(`Welcome, ${user.username}`);
    console.log(`Pre-logged in user: ${user.email}`);

    // Create profile if not already existing (some apps might require this first)
    await page.getByTestId('nav-profile').click();
    const profileFormExists = await page.getByTestId('profile-first-name-input').isVisible();
    if (profileFormExists) {
      await page.getByTestId('profile-first-name-input').fill(getTestProfile().firstName);
      await page.getByTestId('profile-last-name-input').fill(getTestProfile().lastName);
      await page.getByTestId('profile-age-input').fill(String(getTestProfile().age));
      await page.getByTestId('profile-height-input').fill(String(getTestProfile().heightCm));
      await page.getByTestId('profile-weight-input').fill(String(getTestProfile().weightKg));
      await page.getByTestId('profile-gender-select').selectOption(getTestProfile().gender);
      await page.getByTestId('profile-save-button').click();
      await expect(page.getByTestId('success-message')).toContainText('Profile saved successfully');
      console.log(`Created profile for ${user.email}`);
    }
  });

  test.afterEach(async () => {
    apiClient.clearAuthToken();
  });

  test('should allow user to log, view, update, and delete a workout', async ({ page, browserName }) => {
    console.log(`Running on ${browserName}`);

    // 1. Navigate to Log Workout page
    await page.getByTestId('nav-log-workout').click();
    await expect(page).toHaveURL(/.*log-workout/);

    // 2. Fill workout form
    await page.getByTestId('workout-type-select').selectOption(workoutData.type);
    await page.getByTestId('workout-name-input').fill(workoutData.name);
    await page.getByTestId('workout-duration-input').fill(String(workoutData.durationMinutes));
    await page.getByTestId('workout-calories-input').fill(String(workoutData.caloriesBurned));
    await page.getByTestId('workout-date-input').fill(workoutData.date);
    await page.getByTestId('workout-notes-textarea').fill(workoutData.notes);
    // Add exercises if the UI supports it dynamically
    if (workoutData.exercises && workoutData.exercises.length > 0) {
      await page.getByTestId('add-exercise-button').click();
      await page.getByTestId('exercise-name-input-0').fill(workoutData.exercises[0].name);
      await page.getByTestId('exercise-sets-input-0').fill(String(workoutData.exercises[0].sets));
      await page.getByTestId('exercise-reps-input-0').fill(String(workoutData.exercises[0].reps));
      await page.getByTestId('exercise-weight-input-0').fill(String(workoutData.exercises[0].weightKg));
    }
    await page.getByTestId('log-workout-submit-button').click();

    // 3. Verify workout logged and appears in history
    await expect(page.getByTestId('success-message')).toContainText('Workout logged successfully');
    await expect(page).toHaveURL(/.*workout-history/);
    await expect(page.getByTestId('workout-list-item')).toContainText(workoutData.name);
    console.log(`Logged workout: ${workoutData.name}`);

    // 4. Update Logged Workout
    await page.getByTestId(`workout-edit-button-${workoutData.name}`).click(); // Assuming unique data-testid for edit button
    await expect(page).toHaveURL(/.*edit-workout/);
    const updatedDuration = 75;
    await page.getByTestId('workout-duration-input').fill(String(updatedDuration));
    await page.getByTestId('workout-notes-textarea').fill('Updated notes for leg day E2E');
    await page.getByTestId('update-workout-submit-button').click();

    await expect(page.getByTestId('success-message')).toContainText('Workout updated successfully');
    await expect(page).toHaveURL(/.*workout-history/);
    await expect(page.getByTestId('workout-list-item')).toContainText('Updated notes for leg day E2E');
    console.log(`Updated workout: ${workoutData.name}`);

    // 5. Delete Logged Workout
    page.on('dialog', async dialog => {
      expect(dialog.type()).toContain('confirm');
      expect(dialog.message()).toContain('Are you sure you want to delete this workout?');
      await dialog.accept();
    });
    await page.getByTestId(`workout-delete-button-${workoutData.name}`).click();

    await expect(page.getByTestId('success-message')).toContainText('Workout deleted successfully');
    await expect(page).toHaveURL(/.*workout-history/);
    await expect(page.getByTestId('workout-list-item')).not.toContainText(workoutData.name);
    console.log(`Deleted workout: ${workoutData.name}`);
  });

  test('should allow user to create and view fitness goals', async ({ page, browserName }) => {
    console.log(`Running on ${browserName}`);

    // 1. Navigate to Goals page (or dashboard where goals are managed)
    await page.getByTestId('nav-goals').click();
    await expect(page).toHaveURL(/.*goals/);

    // 2. Click to create a new goal
    await page.getByTestId('create-goal-button').click();
    await expect(page).toHaveURL(/.*create-goal/);

    // 3. Fill goal form
    await page.getByTestId('goal-name-input').fill(goalData.name);
    await page.getByTestId('goal-type-select').selectOption(goalData.type);
    await page.getByTestId('goal-target-value-input').fill(String(goalData.targetValue));
    await page.getByTestId('goal-unit-input').fill(goalData.unit);
    await page.getByTestId('goal-start-date-input').fill(goalData.startDate);
    await page.getByTestId('goal-end-date-input').fill(goalData.endDate);
    await page.getByTestId('create-goal-submit-button').click();

    // 4. Verify goal created and displayed on dashboard/goals list
    await expect(page.getByTestId('success-message')).toContainText('Goal created successfully');
    await expect(page).toHaveURL(/.*goals|.*dashboard/);
    await page.getByTestId('nav-goals').click(); // Ensure we are on the goals list
    await expect(page.getByTestId('goal-list-item')).toContainText(goalData.name);
    await expect(page.getByTestId('goal-list-item')).toContainText(String(goalData.targetValue));
    console.log(`Created goal: ${goalData.name}`);
  });

  test('should allow user to browse workout library', async ({ page, browserName }) => {
    console.log(`Running on ${browserName}`);

    // 1. Navigate to Workout Library page
    await page.getByTestId('nav-workout-library').click();
    await expect(page).toHaveURL(/.*workout-library/);

    // 2. Verify library content is displayed
    await expect(page.getByTestId('library-title')).toContainText('Workout Library');
    await expect(page.getByTestId('workout-library-item')).toBeVisible(); // Check if at least one item is visible

    // 3. Optionally, filter or search (if UI supports it)
    // await page.getByTestId('library-search-input').fill('pushups');
    // await expect(page.getByTestId('workout-library-item')).toContainText('Pushups');

    // 4. Click on a workout to view details
    await page.getByTestId('workout-library-item').first().click();
    await expect(page).toHaveURL(/.*workout-library\/.+/);
    await expect(page.getByTestId('workout-detail-name')).toBeVisible();
    await expect(page.getByTestId('workout-detail-description')).toBeVisible();
    console.log(`Browsed workout library and viewed a detail page.`);
  });

  test('should handle API errors gracefully in UI (e.g., failed workout log)', async ({ page, browserName }) => {
    console.log(`Running on ${browserName}`);

    await page.getByTestId('nav-log-workout').click();
    await expect(page).toHaveURL(/.*log-workout/);

    // Simulate an API error by intercepting the request
    await page.route('**/api/workouts', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error during workout log' }),
      });
    });

    // Fill form with valid data, but expect an error due to interception
    await page.getByTestId('workout-type-select').selectOption(workoutData.type);
    await page.getByTestId('workout-name-input').fill('Error Test Workout');
    await page.getByTestId('workout-duration-input').fill('30');
    await page.getByTestId('log-workout-submit-button').click();

    await expect(page.getByTestId('error-message')).toContainText('Internal Server Error during workout log');
    await expect(page).toHaveURL(/.*log-workout/); // Should remain on the same page
    console.log(`Verified error handling for failed workout log.`);
  });
});