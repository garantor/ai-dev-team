import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { Alert } from 'react-native';

interface User {
  id: string;
  email: string;
  name: string;
  university?: string;
  onboardingComplete?: boolean; // Added for onboarding flow
  fitnessGoals?: string[];
  fitnessLevel?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, university: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserOnboardingStatus: (status: boolean) => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      await AsyncStorage.setItem('userToken', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert('Login Failed', error.response?.data?.message || 'An unexpected error occurred.');
      throw error; // Re-throw to allow screen to handle specific errors if needed
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, university: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { email, password, name, university });
      const { token: newToken, user: userData } = response.data;

      await AsyncStorage.setItem('userToken', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      Alert.alert('Success', 'Registration successful! Please complete your onboarding.');
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      Alert.alert('Registration Failed', error.response?.data?.message || 'An unexpected error occurred.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Could not log out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserOnboardingStatus = (status: boolean) => {
    setUser(prevUser => {
      if (prevUser) {
        const updatedUser = { ...prevUser, onboardingComplete: status };
        AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    });
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setUser(prevUser => {
      if (prevUser) {
        const updatedUser = { ...prevUser, ...updates };
        AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      updateUserOnboardingStatus,
      updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
