/**
 * integration/api-client.test.ts
 * Contract tests for the WorkoutExerciseApiClient.
 * Mocks the global fetch API to simulate backend responses.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkoutExerciseApiClient } from './api-client';
import {
  Workout,
  Exercise,
  WorkoutLog,
  ExerciseSetLog,
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
  CreateExercisePayload,
  UpdateExercisePayload,
  CreateWorkoutLogPayload,
  UpdateWorkoutLogPayload,
  CreateExerciseSetLogPayload,
  UpdateExerciseSetLogPayload,
} from './types';
import {
  ApiError,
  NetworkError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from './errors';

// Mock the global fetch function
const mockFetch = vi.fn();

// Helper to create a mock Response object
const createMockResponse = (body: any, options: ResponseInit = {}) => {
  return Promise.resolve({
    ok: options.status ? options.status >= 200 && options.status < 300 : true,
    status: options.status || 200,
    statusText: options.statusText || 'OK',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Headers(),
    url: '',
    redirected: false,
    type: 'default',
    clone: () => createMockResponse(body, options),
    body: null as any,
    bodyUsed: false,
    arrayBuffer: vi.fn(), blob: vi.fn(), formData: vi.fn(), trailer: vi.fn(),
  });
};

describe('WorkoutExerciseApiClient', () => {
  let client: WorkoutExerciseApiClient;
  const BASE_URL = 'http://localhost:3000/api/v1';

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockClear();
    client = new WorkoutExerciseApiClient(BASE_URL);
  });

  // --- Workout Tests ---

  describe('Workouts', () => {
    it('should fetch all workouts successfully', async () => {
      const mockWorkouts: Workout[] = [
        { id: 'w1', name: 'Full Body', description: '3x a week', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true, data: mockWorkouts }));

      const workouts = await client.getWorkouts();

      expect(workouts).toEqual(mockWorkouts);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/workouts`, {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should fetch a workout by ID successfully', async () => {
      const mockWorkout: Workout = { id: 'w1', name: 'Full Body', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true, data: mockWorkout }));

      const workout = await client.getWorkout('w1');

      expect(workout).toEqual(mockWorkout);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/workouts/w1`, {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should throw NotFoundError when fetching a non-existent workout', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: false, message: 'Workout not found.' }, { status: 404 }));

      await expect(client.getWorkout('nonexistent')).rejects.toThrow(NotFoundError);
    });

    it('should create a workout successfully', async () => {
      const createPayload: CreateWorkoutPayload = { name: 'New Workout', description: 'Test' };
      const createdWorkout: Workout = { id: 'w2', ...createPayload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true, data: createdWorkout }, { status: 201 }));

      const workout = await client.createWorkout(createPayload);

      expect(workout).toEqual(createdWorkout);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      });
    });

    it('should throw ValidationError when creating a workout with missing name', async () => {
      const createPayload = { description: 'Test' } as CreateWorkoutPayload;
      await expect(client.createWorkout(createPayload)).rejects.toThrow(ValidationError);
    });

    it('should update a workout successfully', async () => {
      const updatePayload: UpdateWorkoutPayload = { name: 'Updated Workout' };
      const updatedWorkout: Workout = { id: 'w1', name: 'Updated Workout', description: '3x a week', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true, data: updatedWorkout }));

      const workout = await client.updateWorkout('w1', updatePayload);

      expect(workout).toEqual(updatedWorkout);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/workouts/w1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
    });

    it('should delete a workout successfully', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }, { status: 204 }));

      await expect(client.deleteWorkout('w1')).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/workouts/w1`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should throw ValidationError if workout ID is missing for getWorkout', async () => {
      await expect(client.getWorkout('')).rejects.toThrow(ValidationError);
    });
  });

  // --- Exercise Tests ---

  describe('Exercises', () => {
    it('should fetch all exercises successfully', async () => {
      const mockExercises: Exercise[] = [
        { id: 'e1', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true, data: mockExercises }));

      const exercises = await client.getExercises();

      expect(exercises).toEqual(mockExercises);
    });

    it('should create an exercise successfully', async () => {
      const createPayload: CreateExercisePayload = { name: 'Squat', muscleGroup: 'Legs', equipment: 'Barbell' };
      const createdExercise: Exercise = { id: 'e2', ...createPayload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true, data: createdExercise }, { status: 201 }));

      const exercise = await client.createExercise(createPayload);

      expect(exercise).toEqual(createdExercise);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      });
    });

    it('should throw ValidationError when creating an exercise with missing muscleGroup', async () => {
      const createPayload = { name: 'Deadlift' } as CreateExercisePayload;
      await expect(client.createExercise(createPayload)).rejects.toThrow(ValidationError);
    });
  });

  // --- Workout Log Tests ---

  describe('Workout Logs', () => {
    it('should fetch all workout logs successfully', async () => {
      const mockWorkoutLogs: WorkoutLog[] = [
        { id: 'wl1', workoutId: 'w1', startTime: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true, data: mockWorkoutLogs }));

      const workoutLogs = await client.getWorkoutLogs();

      expect(workoutLogs).toEqual(mockWorkoutLogs);
    });

    it('should create a workout log successfully', async () => {
      const startTime = new Date().toISOString();
      const createPayload: CreateWorkoutLogPayload = { workoutId: 'w1', startTime };
      const createdWorkoutLog: WorkoutLog = { id: 'wl2', ...createPayload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true, data: createdWorkoutLog }, { status: 201 }));

      const workoutLog = await client.createWorkoutLog(createPayload);

      expect(workoutLog).toEqual(createdWorkoutLog);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/workout-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      });
    });

    it('should update a workout log successfully', async () => {
      const endTime = new Date().toISOString();
      const updatePayload: UpdateWorkoutLogPayload = { endTime };
      const updatedWorkoutLog: WorkoutLog = { id: 'wl1', workoutId: 'w1', startTime: '2023-01-01T10:00:00Z', endTime, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true, data: updatedWorkoutLog }));

      const workoutLog = await client.updateWorkoutLog('wl1', updatePayload);

      expect(workoutLog).toEqual(updatedWorkoutLog);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/workout-logs/wl1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
    });

    it('should delete a workout log successfully', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }, { status: 204 }));

      await expect(client.deleteWorkoutLog('wl1')).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/workout-logs/wl1`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  // --- Exercise Set Log Tests ---

  describe('Exercise Set Logs', () => {
    it('should create an exercise set log successfully', async () => {
      const createPayload: CreateExerciseSetLogPayload = { exerciseId: 'e1', setNumber: 1, reps: 10, weight: 60 };
      const createdSetLog: ExerciseSetLog = { id: 'esl1', workoutLogId: 'wl1', ...createPayload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true, data: createdSetLog }, { status: 201 }));

      const setLog = await client.createExerciseSetLog('wl1', createPayload);

      expect(setLog).toEqual(createdSetLog);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/workout-logs/wl1/exercise-sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      });
    });

    it('should update an exercise set log successfully', async () => {
      const updatePayload: UpdateExerciseSetLogPayload = { reps: 12, weight: 65 };
      const updatedSetLog: ExerciseSetLog = { id: 'esl1', workoutLogId: 'wl1', exerciseId: 'e1', setNumber: 1, reps: 12, weight: 65, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true, data: updatedSetLog }));

      const setLog = await client.updateExerciseSetLog('wl1', 'esl1', updatePayload);

      expect(setLog).toEqual(updatedSetLog);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/workout-logs/wl1/exercise-sets/esl1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
    });

    it('should delete an exercise set log successfully', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }, { status: 204 }));

      await expect(client.deleteExerciseSetLog('wl1', 'esl1')).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/workout-logs/wl1/exercise-sets/esl1`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should throw ValidationError if workoutLogId is missing for createExerciseSetLog', async () => {
      const createPayload: CreateExerciseSetLogPayload = { exerciseId: 'e1', setNumber: 1, reps: 10 };
      await expect(client.createExerciseSetLog('', createPayload)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if setLogId is missing for updateExerciseSetLog', async () => {
      const updatePayload: UpdateExerciseSetLogPayload = { reps: 12 };
      await expect(client.updateExerciseSetLog('wl1', '', updatePayload)).rejects.toThrow(ValidationError);
    });
  });

  // --- General Error Handling Tests ---

  describe('General Error Handling', () => {
    it('should throw NetworkError on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(client.getWorkouts()).rejects.toThrow(NetworkError);
    });

    it('should throw ApiError for generic 500 errors', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: false, message: 'Server error' }, { status: 500 }));

      await expect(client.getWorkouts()).rejects.toThrow(ApiError);
      await expect(client.getWorkouts()).rejects.toHaveProperty('statusCode', 500);
    });

    it('should throw UnauthorizedError for 401 status', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: false, message: 'Unauthorized' }, { status: 401 }));

      await expect(client.getWorkouts()).rejects.toThrow(UnauthorizedError);
      await expect(client.getWorkouts()).rejects.toHaveProperty('statusCode', 401);
    });

    it('should throw ForbiddenError for 403 status', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: false, message: 'Forbidden' }, { status: 403 }));

      await expect(client.getWorkouts()).rejects.toThrow(ForbiddenError);
      await expect(client.getWorkouts()).rejects.toHaveProperty('statusCode', 403);
    });

    it('should handle non-JSON error responses gracefully', async () => {
      mockFetch.mockResolvedValueOnce(Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('SyntaxError: Unexpected token < in JSON at position 0')),
        text: () => Promise.resolve('<html>Error</html>'),
        headers: new Headers(), url: '', redirected: false, type: 'default', clone: vi.fn(), body: null as any, bodyUsed: false, arrayBuffer: vi.fn(), blob: vi.fn(), formData: vi.fn(), trailer: vi.fn(),
      }));

      await expect(client.getWorkouts()).rejects.toThrow(ApiError);
      await expect(client.getWorkouts()).rejects.toHaveProperty('statusCode', 500);
      await expect(client.getWorkouts()).rejects.toHaveProperty('message', 'Request failed with status 500');
    });

    it('should throw ValidationError if update payload is empty', async () => {
      await expect(client.updateWorkout('w1', {})).rejects.toThrow(ValidationError);
      await expect(client.updateExercise('e1', {})).rejects.toThrow(ValidationError);
      await expect(client.updateWorkoutLog('wl1', {})).rejects.toThrow(ValidationError);
      await expect(client.updateExerciseSetLog('wl1', 'esl1', {})).rejects.toThrow(ValidationError);
    });
  });
});
