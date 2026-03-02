/**
 * integration/api-client.ts
 * API client for interacting with Workout, Exercise, and Logging APIs.
 */

import { API_BASE_URL } from './config';
import {
  ApiResponse,
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

export class WorkoutExerciseApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    if (!baseURL) {
      throw new Error('API Base URL is required.');
    }
    this.baseURL = baseURL;
  }

  private async _request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        let errorData: any = { message: 'An unknown error occurred.' };
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If response is not JSON, use status text
          errorData.message = response.statusText || `HTTP error! Status: ${response.status}`;
        }

        const errorMessage = errorData.message || `Request failed with status ${response.status}`;

        switch (response.status) {
          case 400:
            throw new ValidationError(errorMessage, errorData);
          case 401:
            throw new UnauthorizedError(errorMessage, errorData);
          case 403:
            throw new ForbiddenError(errorMessage, errorData);
          case 404:
            throw new NotFoundError(errorMessage, errorData);
          default:
            throw new ApiError(errorMessage, response.status, errorData);
        }
      }

      // Handle cases where response might be 204 No Content
      if (response.status === 204) {
        return {} as T; // Return an empty object for successful no-content responses
      }

      const data: ApiResponse<T> = await response.json();

      if (!data.success) {
        // Backend-specific error handling if ApiResponse has a 'success: false' field
        throw new ApiError(data.message || 'API call failed.', data.statusCode || response.status, data.error);
      }

      return data.data as T;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error; // Re-throw custom API errors
      } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
        // This typically indicates a network error (e.g., CORS, no internet, server down)
        throw new NetworkError('Network error: Could not connect to the API server.', error);
      } else {
        // Catch any other unexpected errors
        throw new ApiError('An unexpected error occurred during the API request.', 500, error);
      }
    }
  }

  // --- Workout Endpoints ---

  /**
   * Fetches all workouts.
   * @returns A promise that resolves to an array of Workout objects.
   */
  public async getWorkouts(): Promise<Workout[]> {
    return this._request<Workout[]>('/workouts');
  }

  /**
   * Fetches a single workout by its ID.
   * @param id The ID of the workout.
   * @returns A promise that resolves to a Workout object.
   * @throws NotFoundError if the workout is not found.
   */
  public async getWorkout(id: string): Promise<Workout> {
    if (!id) throw new ValidationError('Workout ID is required.');
    return this._request<Workout>(`/workouts/${id}`);
  }

  /**
   * Creates a new workout.
   * @param payload The data for the new workout.
   * @returns A promise that resolves to the created Workout object.
   */
  public async createWorkout(payload: CreateWorkoutPayload): Promise<Workout> {
    if (!payload || !payload.name) throw new ValidationError('Workout name is required.');
    return this._request<Workout>('/workouts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Updates an existing workout.
   * @param id The ID of the workout to update.
   * @param payload The data to update the workout with.
   * @returns A promise that resolves to the updated Workout object.
   * @throws NotFoundError if the workout is not found.
   */
  public async updateWorkout(id: string, payload: UpdateWorkoutPayload): Promise<Workout> {
    if (!id) throw new ValidationError('Workout ID is required.');
    if (!payload || Object.keys(payload).length === 0) throw new ValidationError('Update payload cannot be empty.');
    return this._request<Workout>(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Deletes a workout.
   * @param id The ID of the workout to delete.
   * @returns A promise that resolves when the workout is successfully deleted.
   * @throws NotFoundError if the workout is not found.
   */
  public async deleteWorkout(id: string): Promise<void> {
    if (!id) throw new ValidationError('Workout ID is required.');
    return this._request<void>(`/workouts/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Exercise Endpoints ---

  /**
   * Fetches all exercises.
   * @returns A promise that resolves to an array of Exercise objects.
   */
  public async getExercises(): Promise<Exercise[]> {
    return this._request<Exercise[]>('/exercises');
  }

  /**
   * Fetches a single exercise by its ID.
   * @param id The ID of the exercise.
   * @returns A promise that resolves to an Exercise object.
   * @throws NotFoundError if the exercise is not found.
   */
  public async getExercise(id: string): Promise<Exercise> {
    if (!id) throw new ValidationError('Exercise ID is required.');
    return this._request<Exercise>(`/exercises/${id}`);
  }

  /**
   * Creates a new exercise.
   * @param payload The data for the new exercise.
   * @returns A promise that resolves to the created Exercise object.
   */
  public async createExercise(payload: CreateExercisePayload): Promise<Exercise> {
    if (!payload || !payload.name || !payload.muscleGroup) {
      throw new ValidationError('Exercise name and muscle group are required.');
    }
    return this._request<Exercise>('/exercises', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Updates an existing exercise.
   * @param id The ID of the exercise to update.
   * @param payload The data to update the exercise with.
   * @returns A promise that resolves to the updated Exercise object.
   * @throws NotFoundError if the exercise is not found.
   */
  public async updateExercise(id: string, payload: UpdateExercisePayload): Promise<Exercise> {
    if (!id) throw new ValidationError('Exercise ID is required.');
    if (!payload || Object.keys(payload).length === 0) throw new ValidationError('Update payload cannot be empty.');
    return this._request<Exercise>(`/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Deletes an exercise.
   * @param id The ID of the exercise to delete.
   * @returns A promise that resolves when the exercise is successfully deleted.
   * @throws NotFoundError if the exercise is not found.
   */
  public async deleteExercise(id: string): Promise<void> {
    if (!id) throw new ValidationError('Exercise ID is required.');
    return this._request<void>(`/exercises/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Workout Log Endpoints ---

  /**
   * Fetches all workout logs.
   * @returns A promise that resolves to an array of WorkoutLog objects.
   */
  public async getWorkoutLogs(): Promise<WorkoutLog[]> {
    return this._request<WorkoutLog[]>('/workout-logs');
  }

  /**
   * Fetches a single workout log by its ID.
   * @param id The ID of the workout log.
   * @returns A promise that resolves to a WorkoutLog object.
   * @throws NotFoundError if the workout log is not found.
   */
  public async getWorkoutLog(id: string): Promise<WorkoutLog> {
    if (!id) throw new ValidationError('Workout Log ID is required.');
    return this._request<WorkoutLog>(`/workout-logs/${id}`);
  }

  /**
   * Creates a new workout log.
   * @param payload The data for the new workout log.
   * @returns A promise that resolves to the created WorkoutLog object.
   */
  public async createWorkoutLog(payload: CreateWorkoutLogPayload): Promise<WorkoutLog> {
    if (!payload || !payload.workoutId || !payload.startTime) {
      throw new ValidationError('Workout ID and start time are required for a workout log.');
    }
    return this._request<WorkoutLog>('/workout-logs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Updates an existing workout log.
   * @param id The ID of the workout log to update.
   * @param payload The data to update the workout log with.
   * @returns A promise that resolves to the updated WorkoutLog object.
   * @throws NotFoundError if the workout log is not found.
   */
  public async updateWorkoutLog(id: string, payload: UpdateWorkoutLogPayload): Promise<WorkoutLog> {
    if (!id) throw new ValidationError('Workout Log ID is required.');
    if (!payload || Object.keys(payload).length === 0) throw new ValidationError('Update payload cannot be empty.');
    return this._request<WorkoutLog>(`/workout-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Deletes a workout log.
   * @param id The ID of the workout log to delete.
   * @returns A promise that resolves when the workout log is successfully deleted.
   * @throws NotFoundError if the workout log is not found.
   */
  public async deleteWorkoutLog(id: string): Promise<void> {
    if (!id) throw new ValidationError('Workout Log ID is required.');
    return this._request<void>(`/workout-logs/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Exercise Set Log Endpoints (nested under Workout Logs) ---

  /**
   * Creates a new exercise set log for a specific workout log.
   * @param workoutLogId The ID of the parent workout log.
   * @param payload The data for the new exercise set log.
   * @returns A promise that resolves to the created ExerciseSetLog object.
   */
  public async createExerciseSetLog(
    workoutLogId: string,
    payload: CreateExerciseSetLogPayload
  ): Promise<ExerciseSetLog> {
    if (!workoutLogId) throw new ValidationError('Workout Log ID is required.');
    if (!payload || !payload.exerciseId || !payload.setNumber || !payload.reps) {
      throw new ValidationError('Exercise ID, set number, and reps are required for an exercise set log.');
    }
    return this._request<ExerciseSetLog>(`/workout-logs/${workoutLogId}/exercise-sets`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Updates an existing exercise set log for a specific workout log.
   * @param workoutLogId The ID of the parent workout log.
   * @param setLogId The ID of the exercise set log to update.
   * @param payload The data to update the exercise set log with.
   * @returns A promise that resolves to the updated ExerciseSetLog object.
   * @throws NotFoundError if the exercise set log is not found.
   */
  public async updateExerciseSetLog(
    workoutLogId: string,
    setLogId: string,
    payload: UpdateExerciseSetLogPayload
  ): Promise<ExerciseSetLog> {
    if (!workoutLogId) throw new ValidationError('Workout Log ID is required.');
    if (!setLogId) throw new ValidationError('Exercise Set Log ID is required.');
    if (!payload || Object.keys(payload).length === 0) throw new ValidationError('Update payload cannot be empty.');
    return this._request<ExerciseSetLog>(`/workout-logs/${workoutLogId}/exercise-sets/${setLogId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Deletes an exercise set log for a specific workout log.
   * @param workoutLogId The ID of the parent workout log.
   * @param setLogId The ID of the exercise set log to delete.
   * @returns A promise that resolves when the exercise set log is successfully deleted.
   * @throws NotFoundError if the exercise set log is not found.
   */
  public async deleteExerciseSetLog(workoutLogId: string, setLogId: string): Promise<void> {
    if (!workoutLogId) throw new ValidationError('Workout Log ID is required.');
    if (!setLogId) throw new ValidationError('Exercise Set Log ID is required.');
    return this._request<void>(`/workout-logs/${workoutLogId}/exercise-sets/${setLogId}`, {
      method: 'DELETE',
    });
  }
}
