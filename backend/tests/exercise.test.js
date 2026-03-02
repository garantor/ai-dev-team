import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Exercise from '../src/models/exerciseModel.js';
import { MONGO_URI_TEST } from '../src/config/env.js';

// Ensure MONGO_URI_TEST is loaded from .env for tests
// In a real project, you might use a separate test config or vitest setupFiles
if (!MONGO_URI_TEST) {
  console.error('MONGO_URI_TEST is not defined in .env. Make sure to create a .env file or set the variable.');
  process.exit(1);
}

describe('Exercise API', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI_TEST);
    await Exercise.deleteMany({}); // Clear the collection before all tests
  });

  afterEach(async () => {
    await Exercise.deleteMany({}); // Clear the collection after each test
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  const mockExercise = {
    name: 'Push-up',
    description: 'A basic bodyweight exercise that works the chest, shoulders, and triceps.',
    muscleGroup: ['Chest', 'Shoulders', 'Arms', 'Core'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    isCompound: true,
  };

  describe('POST /api/exercises', () => {
    it('should create a new exercise', async () => {
      const res = await request(app).post('/api/exercises').send(mockExercise);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toEqual(mockExercise.name);
      expect(res.body.muscleGroup).toEqual(expect.arrayContaining(mockExercise.muscleGroup));
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidExercise = { ...mockExercise, name: '' }; // Missing name
      const res = await request(app).post('/api/exercises').send(invalidExercise);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body.errors).toContain('"name" cannot be an empty field');
    });

    it('should return 400 if muscleGroup contains invalid values', async () => {
      const invalidExercise = { ...mockExercise, muscleGroup: ['InvalidMuscle'] };
      const res = await request(app).post('/api/exercises').send(invalidExercise);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body.errors[0]).toContain('"muscleGroup" contains an invalid value');
    });

    it('should return 400 if equipment contains invalid values', async () => {
      const invalidExercise = { ...mockExercise, equipment: ['InvalidEquipment'] };
      const res = await request(app).post('/api/exercises').send(invalidExercise);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body.errors[0]).toContain('"equipment" contains an invalid value');
    });

    it('should return 400 if difficulty is invalid', async () => {
      const invalidExercise = { ...mockExercise, difficulty: 'SuperHard' };
      const res = await request(app).post('/api/exercises').send(invalidExercise);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body.errors[0]).toContain('"difficulty" must be one of');
    });

    it('should return 400 if exercise name already exists', async () => {
      await request(app).post('/api/exercises').send(mockExercise);
      const res = await request(app).post('/api/exercises').send(mockExercise);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Duplicate field value entered: name already exists.');
    });
  });

  describe('GET /api/exercises', () => {
    it('should return an empty array if no exercises exist', async () => {
      const res = await request(app).get('/api/exercises');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    it('should return all exercises', async () => {
      await request(app).post('/api/exercises').send(mockExercise);
      const anotherExercise = {
        name: 'Squat',
        description: 'A full-body exercise that works the legs, glutes, and core.',
        muscleGroup: ['Legs', 'Core', 'Full Body'],
        equipment: ['Barbell', 'Bodyweight'],
        difficulty: 'Intermediate',
        isCompound: true,
      };
      await request(app).post('/api/exercises').send(anotherExercise);

      const res = await request(app).get('/api/exercises');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toEqual(mockExercise.name);
      expect(res.body[1].name).toEqual(anotherExercise.name);
    });
  });

  describe('GET /api/exercises/:id', () => {
    it('should return a single exercise by ID', async () => {
      const createRes = await request(app).post('/api/exercises').send(mockExercise);
      const exerciseId = createRes.body._id;

      const getRes = await request(app).get(`/api/exercises/${exerciseId}`);
      expect(getRes.statusCode).toEqual(200);
      expect(getRes.body).toHaveProperty('_id', exerciseId);
      expect(getRes.body.name).toEqual(mockExercise.name);
    });

    it('should return 404 if exercise not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/exercises/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Exercise not found');
    });

    it('should return 404 for an invalid ID format', async () => {
      const invalidId = 'invalid-id-format';
      const res = await request(app).get(`/api/exercises/${invalidId}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Resource not found');
    });
  });

  describe('PUT /api/exercises/:id', () => {
    it('should update an existing exercise', async () => {
      const createRes = await request(app).post('/api/exercises').send(mockExercise);
      const exerciseId = createRes.body._id;

      const updatedData = { description: 'An updated description for push-ups.', difficulty: 'Intermediate' };
      const res = await request(app).put(`/api/exercises/${exerciseId}`).send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id', exerciseId);
      expect(res.body.description).toEqual(updatedData.description);
      expect(res.body.difficulty).toEqual(updatedData.difficulty);
      expect(res.body.name).toEqual(mockExercise.name); // Name should remain unchanged if not provided
    });

    it('should return 404 if exercise to update not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).put(`/api/exercises/${nonExistentId}`).send({ name: 'Updated Name' });
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Exercise not found');
    });

    it('should return 400 if update data is invalid', async () => {
      const createRes = await request(app).post('/api/exercises').send(mockExercise);
      const exerciseId = createRes.body._id;

      const invalidUpdate = { difficulty: 'Extreme' }; // Invalid difficulty
      const res = await request(app).put(`/api/exercises/${exerciseId}`).send(invalidUpdate);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body.errors[0]).toContain('"difficulty" must be one of');
    });

    it('should return 400 if updating with a duplicate name', async () => {
      const exercise1 = await request(app).post('/api/exercises').send(mockExercise);
      const exercise2Data = {
        name: 'Pull-up',
        description: 'A bodyweight exercise for the back and biceps.',
        muscleGroup: ['Back', 'Arms'],
        equipment: ['Bodyweight'],
        difficulty: 'Intermediate',
        isCompound: true,
      };
      const exercise2 = await request(app).post('/api/exercises').send(exercise2Data);

      const res = await request(app).put(`/api/exercises/${exercise2.body._id}`).send({ name: mockExercise.name });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Duplicate field value entered: name already exists.');
    });
  });

  describe('DELETE /api/exercises/:id', () => {
    it('should delete an existing exercise', async () => {
      const createRes = await request(app).post('/api/exercises').send(mockExercise);
      const exerciseId = createRes.body._id;

      const deleteRes = await request(app).delete(`/api/exercises/${exerciseId}`);
      expect(deleteRes.statusCode).toEqual(200);
      expect(deleteRes.body).toHaveProperty('message', 'Exercise removed successfully');

      const getRes = await request(app).get(`/api/exercises/${exerciseId}`);
      expect(getRes.statusCode).toEqual(404);
    });

    it('should return 404 if exercise to delete not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/exercises/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Exercise not found');
    });
  });
});
