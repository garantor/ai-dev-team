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

describe('Workout API', () => {
  // Connect to a test database before all tests
  before(async () => {
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/workout_test_db';
    await mongoose.connect(mongoUri);
    console.log(`Connected to test DB: ${mongoUri}`);
  });

  // Clear the database before each test
  beforeEach(async () => {
    await Workout.deleteMany({});
    await Exercise.deleteMany({});
  });

  // Disconnect from the database after all tests
  after(async () => {
    await mongoose.disconnect();
    console.log('Disconnected from test DB');
  });

  // Test GET /api/workouts
  describe('GET /api/workouts', () => {
    it('should get all workouts', async () => {
      await Workout.create({ name: 'Morning Routine', description: 'Light cardio', userId: 'user123' });
      await Workout.create({ name: 'Evening Lift', description: 'Heavy weights', userId: 'user123' });

      const res = await chai.request(app).get('/api/workouts');

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(2);
    });

    it('should get workouts filtered by userId', async () => {
      await Workout.create({ name: 'Workout A', userId: 'user1' });
      await Workout.create({ name: 'Workout B', userId: 'user2' });
      await Workout.create({ name: 'Workout C', userId: 'user1' });

      const res = await chai.request(app).get('/api/workouts?userId=user1');

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(2);
      expect(res.body[0].userId).to.equal('user1');
      expect(res.body[1].userId).to.equal('user1');
    });
  });

  // Test GET /api/workouts/:id
  describe('GET /api/workouts/:id', () => {
    it('should get a single workout by id', async () => {
      const workout = await Workout.create({ name: 'Test Workout', description: 'For testing', userId: 'user123' });

      const res = await chai.request(app).get(`/api/workouts/${workout._id}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body.name).to.equal('Test Workout');
    });

    it('should return 404 if workout not found', async () => {
      const res = await chai.request(app).get('/api/workouts/60c72b1f9b1d8b001c8e4d1a'); // Non-existent ID

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Resource not found');
    });

    it('should return 404 for invalid ObjectId format', async () => {
      const res = await chai.request(app).get('/api/workouts/invalidid');

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Resource not found');
    });
  });

  // Test POST /api/workouts
  describe('POST /api/workouts', () => {
    it('should create a new workout', async () => {
      const newWorkout = {
        name: 'New Workout Plan',
        description: 'Full body workout',
        userId: 'testuser',
      };

      const res = await chai.request(app).post('/api/workouts').send(newWorkout);

      expect(res).to.have.status(201);
      expect(res.body).to.be.an('object');
      expect(res.body.name).to.equal('New Workout Plan');
      expect(res.body.userId).to.equal('testuser');
      expect(res.body).to.have.property('_id');
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidWorkout = {
        description: 'Missing name and userId',
      };

      const res = await chai.request(app).post('/api/workouts').send(invalidWorkout);

      expect(res).to.have.status(400);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.equal('Validation failed');
      expect(res.body.errors).to.include('Workout name is required');
      expect(res.body.errors).to.include('User ID is required');
    });
  });

  // Test PUT /api/workouts/:id
  describe('PUT /api/workouts/:id', () => {
    it('should update an existing workout', async () => {
      const workout = await Workout.create({ name: 'Old Name', description: 'Old Desc', userId: 'user123' });
      const updatedData = {
        name: 'Updated Name',
        description: 'Updated Description',
        userId: 'user123' // userId is required by schema even if not changing
      };

      const res = await chai.request(app).put(`/api/workouts/${workout._id}`).send(updatedData);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body.name).to.equal('Updated Name');
      expect(res.body.description).to.equal('Updated Description');
    });

    it('should return 404 if workout to update not found', async () => {
      const updatedData = {
        name: 'Non Existent',
        userId: 'user123'
      };
      const res = await chai.request(app).put('/api/workouts/60c72b1f9b1d8b001c8e4d1a').send(updatedData);

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Resource not found');
    });

    it('should return 400 for invalid update data', async () => {
      const workout = await Workout.create({ name: 'Old Name', description: 'Old Desc', userId: 'user123' });
      const invalidData = {
        name: '', // Invalid name
        userId: 'user123'
      };

      const res = await chai.request(app).put(`/api/workouts/${workout._id}`).send(invalidData);

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Validation failed');
      expect(res.body.errors).to.include('Workout name cannot be empty');
    });
  });

  // Test DELETE /api/workouts/:id
  describe('DELETE /api/workouts/:id', () => {
    it('should delete a workout and its associated exercises', async () => {
      const workout = await Workout.create({ name: 'To Be Deleted', userId: 'user123' });
      await Exercise.create({ workout: workout._id, name: 'Pushups', sets: 3, reps: 10, order: 1 });
      await Exercise.create({ workout: workout._id, name: 'Squats', sets: 3, reps: 10, order: 2 });

      const res = await chai.request(app).delete(`/api/workouts/${workout._id}`);

      expect(res).to.have.status(200);
      expect(res.body.message).to.equal('Workout and associated exercises removed');

      const deletedWorkout = await Workout.findById(workout._id);
      expect(deletedWorkout).to.be.null;

      const exercises = await Exercise.find({ workout: workout._id });
      expect(exercises).to.have.lengthOf(0);
    });

    it('should return 404 if workout to delete not found', async () => {
      const res = await chai.request(app).delete('/api/workouts/60c72b1f9b1d8b001c8e4d1a');

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Resource not found');
    });
  });
});
