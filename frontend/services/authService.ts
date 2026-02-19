import api from '@utils/api';
import { setAuthToken, setUserData, removeAuthToken, removeUserData } from '@utils/storage';
import { AuthResponse, LoginPayload, RegisterPayload, User, UpdateProfilePayload } from '@types/auth';

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    await setAuthToken(response.data.token);
    await setUserData(response.data.user);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    await setAuthToken(response.data.token);
    await setUserData(response.data.user);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await removeAuthToken();
    await removeUserData();
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export const updateUserProfile = async (payload: UpdateProfilePayload): Promise<User> => {
  try {
    const response = await api.put<User>('/users/profile', payload);
    // Update local user data after successful profile update
    await setUserData(response.data);
    return response.data;
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error;
  }
};
