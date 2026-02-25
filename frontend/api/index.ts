import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your backend API base URL
const API_BASE_URL = 'http://localhost:3000/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Optionally, handle token refresh here or redirect to login
      console.log('Token expired or invalid. Redirecting to login...');
      await AsyncStorage.removeItem('userToken');
      // A more robust app would dispatch a logout action here
      // For this example, we'll let the useAuth hook detect the missing token
    }
    return Promise.reject(error);
  }
);

export default api;
