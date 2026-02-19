import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'jwt_token';
const USER_DATA_KEY = 'user_data';

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing auth token:', error);
    throw error;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing auth token:', error);
    throw error;
  }
};

export const setUserData = async (userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

export const getUserData = async (): Promise<any | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Error removing user data:', error);
    throw error;
  }
};

export const clearAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all storage:', error);
    throw error;
  }
};
