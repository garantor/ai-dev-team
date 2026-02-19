import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { query, connectDB } from '../src/config/db.js';

// Use a specific user ID for testing
const TEST_USER_ID = 999;
const AUTH_HEADER = `Bearer ${TEST_USER_ID}`;

describe('Workout Tracking API', () => {
  beforeAll(async () => {
    // Ensure DB connection and table exists before all tests
    await connectDB();
  });

  beforeEach(async () => {
    // Clean up workouts for the test user before each test
    await query('DELETE FROM workouts WHERE user_id = $1', [TEST_USER_ID]);
  });

  afterAll(async () => {
    // Clean up all test user workouts after all tests
    await query('DELETE FROM workouts WHERE user_id = $1', [TEST_USER_ID]);
    // Close DB connection if necessary (pg pool handles this usually)
  });

  // --- POST /api/v1/workouts --- //
  it('should create a new workout for an authenticated user', async () => {
    const newWorkout = {
      type: 'Running',
      duration_minutes: 30,
      calories_burned: 300,
      notes: 'Morning run in the park',
      workout_date: '2023-10-26',
    };

    const res = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', AUTH_HEADER)
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

  it('should return 400 if workout data is invalid', async () => {
    const invalidWorkout = {
      type: '', // Invalid: empty string
      duration_minutes: 0, // Invalid: must be > 0
    };

    const res = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', AUTH_HEADER)
      .send(invalidWorkout);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Workout type cannot be empty.');
    expect(res.body.message).toContain('Duration must be at least 1 minute.');
  });

  it('should return 401 if no authentication token is provided', async () => {
    const newWorkout = {
      type: 'Yoga',
      duration_minutes: 60,
    };

    const res = await request(app)
      .post('/api/v1/workouts')
      .send(newWorkout);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Authentication required: No token provided or invalid format.');
  });

  // --- GET /api/v1/workouts --- //
  it('should retrieve all workouts for the authenticated user', async () => {
    // Create a few workouts for the test user
    await request(app).post('/api/v1/workouts').set('Authorization', AUTH_HEADER).send({
      type: 'Weightlifting', duration_minutes: 60, calories_burned: 400, workout_date: '2023-10-25'
    });
    await request(app).post('/api/v1/workouts').set('Authorization', AUTH_HEADER).send({
      type: 'Cycling', duration_minutes: 45, calories_burned: 350, workout_date: '2023-10-26'
    });

    const res = await request(app)
      .get('/api/v1/workouts')
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(2);
    expect(res.body[0].user_id).toEqual(TEST_USER_ID);
    expect(res.body[1].user_id).toEqual(TEST_USER_ID);
  });

  it('should return an empty array if no workouts exist for the user', async () => {
    const res = await request(app)
      .get('/api/v1/workouts')
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(0);
  });

  it('should return 401 if no authentication token is provided for GET', async () => {
    const res = await request(app)
      .get('/api/v1/workouts');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Authentication required: No token provided or invalid format.');
  });

  // --- PUT /api/v1/workouts/:id --- //
  it('should update an existing workout for the authenticated user', async () => {
    // First, create a workout to update
    const createRes = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', AUTH_HEADER)
      .send({
        type: 'Swimming', duration_minutes: 40, calories_burned: 250, workout_date: '2023-10-20'
      });
    const workoutId = createRes.body.id;

    const updatedData = {
      type: 'Swimming (Freestyle)',
      duration_minutes: 45,
      calories_burned: 300,
      notes: 'Improved speed',
      workout_date: '2023-10-20',
    };

    const res = await request(app)
      .put(`/api/v1/workouts/${workoutId}`)
      .set('Authorization', AUTH_HEADER)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', workoutId);
    expect(res.body.type).toEqual(updatedData.type);
    expect(res.body.duration_minutes).toEqual(updatedData.duration_minutes);
    expect(res.body.calories_burned).toEqual(updatedData.calories_burned);
    expect(res.body.notes).toEqual(updatedData.notes);
  });

  it('should return 404 if workout to update is not found or not owned by user', async () => {
    const nonExistentId = 999999;
    const updatedData = {
      type: 'Hiking', duration_minutes: 120, calories_burned: 600, workout_date: '2023-10-27'
    };

    const res = await request(app)
      .put(`/api/v1/workouts/${nonExistentId}`)
      .set('Authorization', AUTH_HEADER)
      .send(updatedData);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Workout not found or not authorized to update.');
  });

  it('should return 400 if update data is invalid', async () => {
    // First, create a workout
    const createRes = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', AUTH_HEADER)
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
      .set('Authorization', AUTH_HEADER)
      .send(invalidUpdateData);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Workout type should have a minimum length of 2.');
    expect(res.body.message).toContain('Duration must be at least 1 minute.');
  });

  it('should return 401 if no authentication token is provided for PUT', async () => {
    const res = await request(app)
      .put('/api/v1/workouts/1')
      .send({ type: 'Test', duration_minutes: 10 });

    expect(res.statusCode).toEqual(401);
  });

  // --- DELETE /api/v1/workouts/:id --- //
  it('should delete an existing workout for the authenticated user', async () => {
    // First, create a workout to delete
    const createRes = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', AUTH_HEADER)
      .send({
        type: 'Stretching', duration_minutes: 20, workout_date: '2023-10-19'
      });
    const workoutId = createRes.body.id;

    const res = await request(app)
      .delete(`/api/v1/workouts/${workoutId}`)
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toEqual(204);

    // Verify it's actually deleted
    const getRes = await request(app)
      .get('/api/v1/workouts')
      .set('Authorization', AUTH_HEADER);
    expect(getRes.body.some(w => w.id === workoutId)).toBeFalsy();
  });

  it('should return 404 if workout to delete is not found or not owned by user', async () => {
    const nonExistentId = 999999;

    const res = await request(app)
      .delete(`/api/v1/workouts/${nonExistentId}`)
      .set('Authorization', AUTH_HEADER);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Workout not found or not authorized to delete.');
  });

  it('should return 401 if no authentication token is provided for DELETE', async () => {
    const res = await request(app)
      .delete('/api/v1/workouts/1');

    expect(res.statusCode).toEqual(401);
  });
});
