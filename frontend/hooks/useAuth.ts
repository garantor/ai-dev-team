import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { User, LoginPayload, RegisterPayload, AuthResponse } from '@types/auth';
import { getAuthToken, getUserData, setAuthToken, setUserData, removeAuthToken, removeUserData } from '@utils/storage';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '@services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await getAuthToken();
        const storedUser = await getUserData();
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (e) {
        console.error('Failed to load auth data from storage', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const handleAuthSuccess = async (authResponse: AuthResponse) => {
    await setAuthToken(authResponse.token);
    await setUserData(authResponse.user);
    setToken(authResponse.token);
    setUser(authResponse.user);
    setError(null);
  };

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const authResponse = await apiLogin(payload);
      await handleAuthSuccess(authResponse);
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', e);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const authResponse = await apiRegister(payload);
      await handleAuthSuccess(authResponse);
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', e);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiLogout();
      setToken(null);
      setUser(null);
    } catch (e: any) {
      const errorMessage = e.message || 'Logout failed.';
      setError(errorMessage);
      console.error('Logout error:', e);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      await setUserData(updatedUser); // Persist updated user data
    }
  }, [user]);

  const value = React.useMemo(
    () => ({
      user,
      token,
      isLoading,
      error,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, isLoading, error, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
