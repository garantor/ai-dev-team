import axios from 'axios';
import { Workout, WorkoutFormData } from '../types';

const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your backend API URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getWorkouts = async (): Promise<Workout[]> => {
  try {
    const response = await api.get('/workouts');
    // Sort by date descending (newest first)
    return response.data.sort((a: Workout, b: Workout) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw new Error('Failed to fetch workouts. Please try again.');
  }
};

export const getWorkoutById = async (id: string): Promise<Workout> => {
  try {
    const response = await api.get(`/workouts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching workout with ID ${id}:`, error);
    throw new Error(`Failed to fetch workout details for ID ${id}.`);
  }
};

export const createWorkout = async (workoutData: WorkoutFormData): Promise<Workout> => {
  try {
    const response = await api.post('/workouts', { ...workoutData, date: new Date().toISOString() });
    return response.data;
  } catch (error) {
    console.error('Error creating workout:', error);
    throw new Error('Failed to log workout. Please check your input.');
  }
};

export const updateWorkout = async (id: string, workoutData: WorkoutFormData): Promise<Workout> => {
  try {
    const response = await api.put(`/workouts/${id}`, workoutData);
    return response.data;
  } catch (error) {
    console.error(`Error updating workout with ID ${id}:`, error);
    throw new Error(`Failed to update workout for ID ${id}.`);
  }
};

export const deleteWorkout = async (id: string): Promise<void> => {
  try {
    await api.delete(`/workouts/${id}`);
  } catch (error) {
    console.error(`Error deleting workout with ID ${id}:`, error);
    throw new Error(`Failed to delete workout for ID ${id}.`);
  }
};
