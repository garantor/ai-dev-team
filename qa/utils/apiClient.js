import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './qa/.env' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

class ApiClient {
  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.token = null;

    this.instance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Basic error logging
        console.error('API Error:', error.response?.status, error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    this.token = token;
  }

  clearAuthToken() {
    this.token = null;
  }

  async register(userData) {
    return this.instance.post('/auth/register', userData);
  }

  async login(credentials) {
    const response = await this.instance.post('/auth/login', credentials);
    if (response.data && response.data.token) {
      this.setAuthToken(response.data.token);
    }
    return response;
  }

  async logout() {
    // Assuming a logout endpoint invalidates the token server-side
    // Or simply clear client-side token
    this.clearAuthToken();
    return { status: 200, message: 'Logged out successfully' }; // Simulate success
  }

  async getProfile() {
    return this.instance.get('/users/profile');
  }

  async createProfile(profileData) {
    return this.instance.post('/users/profile', profileData);
  }

  async updateProfile(profileData) {
    return this.instance.put('/users/profile', profileData);
  }

  async logWorkout(workoutData) {
    return this.instance.post('/workouts', workoutData);
  }

  async getWorkouts() {
    return this.instance.get('/workouts');
  }

  async getWorkoutById(workoutId) {
    return this.instance.get(`/workouts/${workoutId}`);
  }

  async updateWorkout(workoutId, workoutData) {
    return this.instance.put(`/workouts/${workoutId}`, workoutData);
  }

  async deleteWorkout(workoutId) {
    return this.instance.delete(`/workouts/${workoutId}`);
  }

  async createGoal(goalData) {
    return this.instance.post('/goals', goalData);
  }

  async getGoals() {
    return this.instance.get('/goals');
  }

  async getWorkoutLibrary() {
    return this.instance.get('/workouts/library');
  }
}

export const apiClient = new ApiClient();