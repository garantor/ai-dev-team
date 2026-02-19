import { Workout } from '../types/workout';

const BASE_URL = 'http://localhost:3000/api'; // Replace with your actual backend API URL

interface ApiError extends Error {
  status?: number;
  response?: any;
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error: ApiError = new Error(`HTTP error! status: ${response.status}`);
    error.status = response.status;
    try {
      error.response = await response.json();
    } catch (e) {
      error.response = await response.text();
    }
    throw error;
  }
  return response.json();
};

export const getWorkouts = async (): Promise<Workout[]> => {
  try {
    const response = await fetch(`${BASE_URL}/workouts`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
};

export const getWorkoutById = async (id: string): Promise<Workout> => {
  try {
    const response = await fetch(`${BASE_URL}/workouts/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching workout ${id}:`, error);
    throw error;
  }
};

export const createWorkout = async (workout: Omit<Workout, 'id' | 'date'>): Promise<Workout> => {
  try {
    const response = await fetch(`${BASE_URL}/workouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...workout, date: new Date().toISOString() }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating workout:', error);
    throw error;
  }
};

export const updateWorkout = async (id: string, workout: Partial<Omit<Workout, 'id' | 'date'>>): Promise<Workout> => {
  try {
    const response = await fetch(`${BASE_URL}/workouts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workout),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error updating workout ${id}:`, error);
    throw error;
  }
};

export const deleteWorkout = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/workouts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      await handleResponse(response); // Throws error if not ok
    }
  } catch (error) {
    console.error(`Error deleting workout ${id}:`, error);
    throw error;
  }
};
