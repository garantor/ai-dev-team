import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Schedule from '../src/models/Schedule.js';
import { StatusCodes } from 'http-status-codes';

let mongoServer;
let agent;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  agent = request.agent(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Schedule.deleteMany({});
});

afterEach(async () => {
  // Clean up any data created during tests
  await Schedule.deleteMany({});
});

describe('Schedule API', () => {
  const mockSchedule = {
    title: 'Morning Workout',
    description: 'Full body workout with cardio',
    date: '2024-07-20',
    startTime: '08:00',
    endTime: '09:30',
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 10 },
      { name: 'Squats', sets: 3, reps: 12 },
    ],
  };

  // Test POST /api/schedules
  it('should create a new schedule', async () => {
    const res = await agent.post('/api/schedules').send(mockSchedule);

    expect(res.statusCode).toEqual(StatusCodes.CREATED);
    expect(res.body.status).toEqual('success');
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.title).toEqual(mockSchedule.title);
    expect(res.body.data.exercises).toHaveLength(2);
  });

  it('should return 400 if required fields are missing during creation', async () => {
    const invalidSchedule = { ...mockSchedule, title: '' }; // Missing title
    const res = await agent.post('/api/schedules').send(invalidSchedule);

    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual('fail');
    expect(res.body.message).toContain('Title cannot be empty');
  });

  it('should return 400 if end time is not after start time', async () => {
    const invalidSchedule = { ...mockSchedule, startTime: '09:00', endTime: '08:00' };
    const res = await agent.post('/api/schedules').send(invalidSchedule);

    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual('fail');
    expect(res.body.message).toContain('End time must be after start time');
  });

  // Test GET /api/schedules
  it('should retrieve all schedules', async () => {
    await agent.post('/api/schedules').send(mockSchedule);
    await agent.post('/api/schedules').send({ ...mockSchedule, title: 'Evening Run' });

    const res = await agent.get('/api/schedules');

    expect(res.statusCode).toEqual(StatusCodes.OK);
    expect(res.body.status).toEqual('success');
    expect(res.body.results).toEqual(2);
    expect(res.body.data).toHaveLength(2);
  });

  it('should retrieve an empty array if no schedules exist', async () => {
    const res = await agent.get('/api/schedules');

    expect(res.statusCode).toEqual(StatusCodes.OK);
    expect(res.body.status).toEqual('success');
    expect(res.body.results).toEqual(0);
    expect(res.body.data).toHaveLength(0);
  });

  // Test GET /api/schedules/:id
  it('should retrieve a schedule by ID', async () => {
    const createRes = await agent.post('/api/schedules').send(mockSchedule);
    const scheduleId = createRes.body.data._id;

    const getRes = await agent.get(`/api/schedules/${scheduleId}`);

    expect(getRes.statusCode).toEqual(StatusCodes.OK);
    expect(getRes.body.status).toEqual('success');
    expect(getRes.body.data._id).toEqual(scheduleId);
    expect(getRes.body.data.title).toEqual(mockSchedule.title);
  });

  it('should return 404 if schedule ID is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await agent.get(`/api/schedules/${nonExistentId}`);

    expect(res.statusCode).toEqual(StatusCodes.NOT_FOUND);
    expect(res.body.status).toEqual('fail');
    expect(res.body.message).toEqual('No schedule found with that ID');
  });

  it('should return 400 for an invalid schedule ID format', async () => {
    const invalidId = '123';
    const res = await agent.get(`/api/schedules/${invalidId}`);

    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual('fail');
    expect(res.body.message).toContain('Invalid _id: 123');
  });

  // Test PUT /api/schedules/:id
  it('should update a schedule by ID', async () => {
    const createRes = await agent.post('/api/schedules').send(mockSchedule);
    const scheduleId = createRes.body.data._id;

    const updatedData = {
      title: 'Evening Yoga',
      description: 'Relaxing yoga session',
      startTime: '19:00',
      endTime: '20:00',
    };

    const updateRes = await agent.put(`/api/schedules/${scheduleId}`).send(updatedData);

    expect(updateRes.statusCode).toEqual(StatusCodes.OK);
    expect(updateRes.body.status).toEqual('success');
    expect(updateRes.body.data._id).toEqual(scheduleId);
    expect(updateRes.body.data.title).toEqual(updatedData.title);
    expect(updateRes.body.data.description).toEqual(updatedData.description);
    expect(updateRes.body.data.startTime).toEqual(updatedData.startTime);
  });

  it('should return 404 if trying to update a non-existent schedule', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const updatedData = { title: 'Non-existent Update' };

    const res = await agent.put(`/api/schedules/${nonExistentId}`).send(updatedData);

    expect(res.statusCode).toEqual(StatusCodes.NOT_FOUND);
    expect(res.body.status).toEqual('fail');
    expect(res.body.message).toEqual('No schedule found with that ID');
  });

  it('should return 400 if update data is invalid', async () => {
    const createRes = await agent.post('/api/schedules').send(mockSchedule);
    const scheduleId = createRes.body.data._id;

    const invalidUpdateData = { title: '', description: 'a'.repeat(600) };

    const res = await agent.put(`/api/schedules/${scheduleId}`).send(invalidUpdateData);

    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual('fail');
    expect(res.body.message).toContain('Title cannot be empty');
    expect(res.body.message).toContain('Description cannot be more than 500 characters');
  });

  // Test DELETE /api/schedules/:id
  it('should delete a schedule by ID', async () => {
    const createRes = await agent.post('/api/schedules').send(mockSchedule);
    const scheduleId = createRes.body.data._id;

    const deleteRes = await agent.delete(`/api/schedules/${scheduleId}`);

    expect(deleteRes.statusCode).toEqual(StatusCodes.NO_CONTENT);
    expect(deleteRes.body.status).toEqual('success');
    expect(deleteRes.body.data).toBeNull();

    const getRes = await agent.get(`/api/schedules/${scheduleId}`);
    expect(getRes.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  it('should return 404 if trying to delete a non-existent schedule', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await agent.delete(`/api/schedules/${nonExistentId}`);

    expect(res.statusCode).toEqual(StatusCodes.NOT_FOUND);
    expect(res.body.status).toEqual('fail');
    expect(res.body.message).toEqual('No schedule found with that ID');
  });
});
