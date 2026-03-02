import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/app.js';
import mongoose from 'mongoose';
import Workout from '../src/models/Workout.js';
import Exercise from '../src/models/Exercise.js';
import dotenv from 'dotenv';

dotenv.config();

chai.use(chaiHttp);
const expect = chai.expect;

describe('Exercise API', () => {
  let workoutId;

  // Connect to a test database before all tests
  before(async () => {
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/workout_test_db';
    await mongoose.connect(mongoUri);
    console.log(`Connected to test DB: ${mongoUri}`);
  });

  // Clear the database and create a new workout before each test
  beforeEach(async () => {
    await Workout.deleteMany({});
    await Exercise.deleteMany({});
    const workout = await Workout.create({ name: 'Test Workout for Exercises', userId: 'testuser1' });
    workoutId = workout._id;
  });

  // Disconnect from the database after all tests
  after(async () => {
    await mongoose.disconnect();
    console.log('Disconnected from test DB');
  });

  // Test POST /api/workouts/:workoutId/exercises
  describe('POST /api/workouts/:workoutId/exercises', () => {
    it('should create a new exercise for a workout', async () => {
      const newExercise = {
        name: 'Bench Press',
        sets: 3,
        reps: 8,
        weight: 60,
        unit: 'kg',
        order: 1,
      };

      const res = await chai.request(app).post(`/api/workouts/${workoutId}/exercises`).send(newExercise);

      expect(res).to.have.status(201);
      expect(res.body).to.be.an('object');
      expect(res.body.name).to.equal('Bench Press');
      expect(res.body.workout.toString()).to.equal(workoutId.toString());
      expect(res.body).to.have.property('_id');
    });

    it('should return 400 if required exercise fields are missing', async () => {
      const invalidExercise = {
        name: 'Incomplete Exercise',
        sets: 3,
        // reps is missing
      };

      const res = await chai.request(app).post(`/api/workouts/${workoutId}/exercises`).send(invalidExercise);

      expect(res).to.have.status(400);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.equal('Validation failed');
      expect(res.body.errors).to.include('Reps is required');
    });

    it('should return 404 if workout does not exist', async () => {
      const nonExistentWorkoutId = '60c72b1f9b1d8b001c8e4d1a';
      const newExercise = {
        name: 'Deadlift',
        sets: 3,
        reps: 5,
        order: 1,
      };

      const res = await chai.request(app).post(`/api/workouts/${nonExistentWorkoutId}/exercises`).send(newExercise);

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Workout not found');
    });
  });

  // Test GET /api/workouts/:workoutId/exercises
  describe('GET /api/workouts/:workoutId/exercises', () => {
    it('should get all exercises for a specific workout', async () => {
      await Exercise.create({ workout: workoutId, name: 'Squats', sets: 3, reps: 10, order: 1 });
      await Exercise.create({ workout: workoutId, name: 'Lunges', sets: 3, reps: 10, order: 2 });

      const res = await chai.request(app).get(`/api/workouts/${workoutId}/exercises`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(2);
      expect(res.body[0].name).to.equal('Squats'); // Should be sorted by order
      expect(res.body[1].name).to.equal('Lunges');
    });

    it('should return empty array if no exercises for workout', async () => {
      const res = await chai.request(app).get(`/api/workouts/${workoutId}/exercises`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(0);
    });

    it('should return 404 if workout does not exist', async () => {
      const nonExistentWorkoutId = '60c72b1f9b1d8b001c8e4d1a';
      const res = await chai.request(app).get(`/api/workouts/${nonExistentWorkoutId}/exercises`);

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Workout not found');
    });
  });

  // Test GET /api/workouts/:workoutId/exercises/:exerciseId
  describe('GET /api/workouts/:workoutId/exercises/:exerciseId', () => {
    it('should get a single exercise by ID within a workout', async () => {
      const exercise = await Exercise.create({ workout: workoutId, name: 'Pushups', sets: 3, reps: 15, order: 1 });

      const res = await chai.request(app).get(`/api/workouts/${workoutId}/exercises/${exercise._id}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body.name).to.equal('Pushups');
      expect(res.body._id.toString()).to.equal(exercise._id.toString());
    });

    it('should return 404 if exercise not found in this workout', async () => {
      const otherWorkout = await Workout.create({ name: 'Other Workout', userId: 'user2' });
      const exercise = await Exercise.create({ workout: otherWorkout._id, name: 'Situps', sets: 3, reps: 20, order: 1 });

      const res = await chai.request(app).get(`/api/workouts/${workoutId}/exercises/${exercise._id}`);

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Exercise not found in this workout');
    });

    it('should return 404 for non-existent exercise ID', async () => {
      const nonExistentExerciseId = '60c72b1f9b1d8b001c8e4d1a';
      const res = await chai.request(app).get(`/api/workouts/${workoutId}/exercises/${nonExistentExerciseId}`);

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Exercise not found in this workout');
    });
  });

  // Test PUT /api/workouts/:workoutId/exercises/:exerciseId
  describe('PUT /api/workouts/:workoutId/exercises/:exerciseId', () => {
    it('should update an existing exercise', async () => {
      const exercise = await Exercise.create({ workout: workoutId, name: 'Old Exercise', sets: 3, reps: 10, order: 1 });
      const updatedData = {
        name: 'Updated Exercise Name',
        sets: 4,
        reps: 12,
        weight: 70,
        unit: 'lbs',
        order: 2,
      };

      const res = await chai.request(app).put(`/api/workouts/${workoutId}/exercises/${exercise._id}`).send(updatedData);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body.name).to.equal('Updated Exercise Name');
      expect(res.body.sets).to.equal(4);
      expect(res.body.reps).to.equal(12);
      expect(res.body.weight).to.equal(70);
      expect(res.body.unit).to.equal('lbs');
      expect(res.body.order).to.equal(2);
    });

    it('should return 404 if exercise to update not found in this workout', async () => {
      const otherWorkout = await Workout.create({ name: 'Other Workout', userId: 'user2' });
      const exercise = await Exercise.create({ workout: otherWorkout._id, name: 'Situps', sets: 3, reps: 20, order: 1 });

      const updatedData = {
        name: 'Updated Situps',
        sets: 4,
        reps: 25,
      };

      const res = await chai.request(app).put(`/api/workouts/${workoutId}/exercises/${exercise._id}`).send(updatedData);

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Exercise not found in this workout');
    });

    it('should return 400 for invalid update data', async () => {
      const exercise = await Exercise.create({ workout: workoutId, name: 'Valid Exercise', sets: 3, reps: 10, order: 1 });
      const invalidData = {
        sets: 0, // Invalid sets
      };

      const res = await chai.request(app).put(`/api/workouts/${workoutId}/exercises/${exercise._id}`).send(invalidData);

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Validation failed');
      expect(res.body.errors).to.include('Sets must be at least 1');
    });
  });

  // Test DELETE /api/workouts/:workoutId/exercises/:exerciseId
  describe('DELETE /api/workouts/:workoutId/exercises/:exerciseId', () => {
    it('should delete an exercise from a workout', async () => {
      const exercise = await Exercise.create({ workout: workoutId, name: 'To Be Deleted', sets: 3, reps: 10, order: 1 });

      const res = await chai.request(app).delete(`/api/workouts/${workoutId}/exercises/${exercise._id}`);

      expect(res).to.have.status(200);
      expect(res.body.message).to.equal('Exercise removed');

      const deletedExercise = await Exercise.findById(exercise._id);
      expect(deletedExercise).to.be.null;
    });

    it('should return 404 if exercise to delete not found in this workout', async () => {
      const otherWorkout = await Workout.create({ name: 'Other Workout', userId: 'user2' });
      const exercise = await Exercise.create({ workout: otherWorkout._id, name: 'Situps', sets: 3, reps: 20, order: 1 });

      const res = await chai.request(app).delete(`/api/workouts/${workoutId}/exercises/${exercise._id}`);

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Exercise not found in this workout');
    });
  });
});
