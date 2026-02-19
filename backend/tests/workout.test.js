import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDb, closeDb, query } from '../src/config/db.js';
import { deleteAllWorkoutsByUserId } from '../src/models/workout.model.js';

// Set NODE_ENV to 'test' for tests to use TEST_DATABASE_URL
process.env.NODE_ENV = 'test';

const TEST_USER_ID = 999;
const AUTH_HEADERS = { 'x-user-id': TEST_USER_ID };

describe('Workout Tracking API', () => {
  beforeAll(async () => {
    await connectDb();
    // Ensure the test database is clean for the test user before all tests
    await deleteAllWorkoutsByUserId(TEST_USER_ID);
  });

  afterAll(async () => {
    // Clean up after all tests
    await deleteAllWorkoutsByUserId(TEST_USER_ID);
    await closeDb();
  });

  beforeEach(async () => {
    // Clean up before each test to ensure isolation
    await deleteAllWorkoutsByUserId(TEST_USER_ID);
  });

  // --- POST /api/v1/workouts --- //
  it('should log a new workout for the authenticated user', async () => {
    const newWorkout = {
      type: 'Running',
      duration_minutes: 30,
      calories_burned: 300,
      notes: 'Morning run in the park.',
      workout_date: '2023-10-26'
    };

    const res = await request(app)
      .post('/api/v1/workouts')
      .set(AUTH_HEADERS)
      .send(newWorkout);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.user_id).toEqual(TEST_USER_ID);
    expect(res.body.type).toEqual(newWorkout.type);
    expect(res.body.duration_minutes).toEqual(newWorkout.duration_minutes);
    expect(res.body.calories_burned).toEqual(newWorkout.calories_burned);
    expect(res.body.notes).toEqual(newWorkout.notes);
    expect(new Date(res.body.workout_date).toISOString().split('T')[0]).toEqual(newWorkout.workout_date);
  });

  it('should return 400 if required fields are missing when logging a workout', async () => {
    const invalidWorkout = {
      type: 'Cycling'
      // duration_minutes is missing
    };

    const res = await request(app)
      .post('/api/v1/workouts')
      .set(AUTH_HEADERS)
      .send(invalidWorkout);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Validation error');
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors).toContain('Duration in minutes is required.');
  });

  it('should return 400 if workout data has invalid values', async () => {
    const invalidWorkout = {
      type: '', // Invalid: empty string
      duration_minutes: 0, // Invalid: must be > 0
      calories_burned: 100,
      workout_date: '2023-10-26'
    };

    const res = await request(app)
      .post('/api/v1/workouts')
      .set(AUTH_HEADERS)
      .send(invalidWorkout);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Validation error');
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors).toContain('Workout type cannot be empty.');
    expect(res.body.errors).toContain('Duration in minutes must be at least 1.');
  });

  // --- GET /api/v1/workouts --- //
  it('should retrieve all workouts for the authenticated user', async () => {
    // Log a few workouts first
    await request(app).post('/api/v1/workouts').set(AUTH_HEADERS).send({
      type: 'Weightlifting',
      duration_minutes: 60,
      calories_burned: 400,
      workout_date: '2023-10-25'
    });
    await request(app).post('/api/v1/workouts').set(AUTH_HEADERS).send({
      type: 'Cycling',
      duration_minutes: 45,
      calories_burned: 350,
      workout_date: '2023-10-26'
    });
    await request(app).post('/api/v1/workouts').set(AUTH_HEADERS).send({
      type: 'Yoga',
      duration_minutes: 45,
      calories_burned: 150,
      workout_date: '2023-10-26'
    });

    const res = await request(app)
      .get('/api/v1/workouts')
      .set(AUTH_HEADERS);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(3);
    expect(res.body[0].user_id).toEqual(TEST_USER_ID);
    expect(res.body[1].user_id).toEqual(TEST_USER_ID);
    expect(res.body[2].user_id).toEqual(TEST_USER_ID);
  });

  it('should return an empty array if no workouts exist for the user', async () => {
    const res = await request(app)
      .get('/api/v1/workouts')
      .set(AUTH_HEADERS);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(0);
  });

  it('should return 401 if no authentication token is provided for GET', async () => {
    const res = await request(app)
      .get('/api/v1/workouts');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Authentication required.');
  });

  // --- PUT /api/v1/workouts/:id --- //
  it('should update an existing workout for the authenticated user', async () => {
    // First, log a workout
    const postRes = await request(app)
      .post('/api/v1/workouts')
      .set(AUTH_HEADERS)
      .send({
        type: 'Swimming',
        duration_minutes: 40,
        calories_burned: 250,
        workout_date: '2023-10-27'
      });

    const workoutId = postRes.body.id;

    const updatedData = {
      duration_minutes: 50,
      notes: 'Evening swim, felt great!'
    };

    const res = await request(app)
      .put(`/api/v1/workouts/${workoutId}`)
      .set(AUTH_HEADERS)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', workoutId);
    expect(res.body.duration_minutes).toEqual(updatedData.duration_minutes);
    expect(res.body.notes).toEqual(updatedData.notes);
    expect(res.body.type).toEqual('Swimming'); // Type should remain unchanged
  });

  it('should return 404 if workout to update is not found or not owned by user', async () => {
    const res = await request(app)
      .put('/api/v1/workouts/99999') // Non-existent ID
      .set(AUTH_HEADERS)
      .send({ type: 'Hiking' });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Workout not found or not authorized to update.');
  });

  it('should return 400 if update data is invalid', async () => {
    // First, create a workout
    const createRes = await request(app)
      .post('/api/v1/workouts')
      .set(AUTH_HEADERS)
      .send({
        type: 'Jogging', duration_minutes: 30, workout_date: '2023-10-21'
      });
    const workoutId = createRes.body.id;

    const invalidUpdateData = {
      type: 'J',
      duration_minutes: -10,
    };

    const res = await request(app)
      .put(`/api/v1/workouts/${workoutId}`)
      .set(AUTH_HEADERS)
      .send(invalidUpdateData);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Validation error');
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors).toContain('Workout type should have a minimum length of 2.');
    expect(res.body.errors).toContain('Duration in minutes must be at least 1.');
  });

  it('should return 401 if no authentication token is provided for PUT', async () => {
    const res = await request(app)
      .put('/api/v1/workouts/1')
      .send({ type: 'Test', duration_minutes: 10 });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Authentication required.');
  });

  // --- DELETE /api/v1/workouts/:id --- //
  it('should delete an existing workout for the authenticated user', async () => {
    // First, log a workout
    const postRes = await request(app)
      .post('/api/v1/workouts')
      .set(AUTH_HEADERS)
      .send({
        type: 'Cycling',
        duration_minutes: 75,
        calories_burned: 600,
        workout_date: '2023-10-28'
      });

    const workoutId = postRes.body.id;

    const res = await request(app)
      .delete(`/api/v1/workouts/${workoutId}`)
      .set(AUTH_HEADERS);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Workout deleted successfully.');
    expect(res.body).toHaveProperty('id', workoutId);

    // Verify it's actually deleted
    const getRes = await request(app)
      .get('/api/v1/workouts')
      .set(AUTH_HEADERS);
    expect(getRes.body.some(w => w.id === workoutId)).toBeFalsy();
  });

  it('should return 404 if workout to delete is not found or not owned by user', async () => {
    const res = await request(app)
      .delete('/api/v1/workouts/99999') // Non-existent ID
      .set(AUTH_HEADERS);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Workout not found or not authorized to delete.');
  });

  it('should return 401 if no authentication token is provided for DELETE', async () => {
    const res = await request(app)
      .delete('/api/v1/workouts/1');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Authentication required.');
  });

  it('should return 401 if no authentication header is provided', async () => {
    const newWorkout = {
      type: 'Running',
      duration_minutes: 30,
      calories_burned: 300,
      notes: 'Morning run in the park.',
      workout_date: '2023-10-26'
    };

    const res = await request(app)
      .post('/api/v1/workouts')
      .send(newWorkout);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Authentication required.');
  });
});