import axios from 'axios';
import { getAuthToken, removeAuthToken, removeUserData } from './storage';

// Replace with your actual backend URL
const API_BASE_URL = 'http://localhost:3000/api'; // Example for local development

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration or invalid tokens
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is 401 Unauthorized and it's not a login/register request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Optionally, try to refresh token here if you have a refresh token mechanism
      // For simplicity, we'll just log out the user.
      console.warn('Unauthorized request. Logging out user.');
      await removeAuthToken();
      await removeUserData();
      // You might want to navigate the user back to the login screen here
      // This would typically be handled by a global state/context or navigation listener
    }
    return Promise.reject(error);
  }
);

export default api;
