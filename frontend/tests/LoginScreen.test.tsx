import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '@screens/LoginScreen';
import { AuthProvider, useAuth } from '@hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

// Mock @react-navigation/native-stack
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  replace: mockReplace,
  goBack: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(),
} as unknown as NativeStackNavigationProp<any>;

// Mock useAuth hook
jest.mock('@hooks/useAuth', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Alert.alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', university: 'Test Uni' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      user: null, // Initially no user data for login screen
    });
  });

  it('renders correctly with email and password inputs and a login button', () => {
    const { getByLabelText, getByText } = render(
      <AuthProvider>
        <LoginScreen navigation={mockNavigation} route={{ key: 'Login', name: 'Login' }} />
      </AuthProvider>
    );

    expect(getByLabelText('Email')).toBeTruthy();
    expect(getByLabelText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText("Don't have an account? Register")).toBeTruthy();
  });

  it('displays error messages for invalid input', async () => {
    const { getByText, getByLabelText } = render(
      <AuthProvider>
        <LoginScreen navigation={mockNavigation} route={{ key: 'Login', name: 'Login' }} />
      </AuthProvider>
    );

    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Email is required.')).toBeTruthy();
      expect(getByText('Password is required.')).toBeTruthy();
    });

    fireEvent.changeText(getByLabelText('Email'), 'invalid-email');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid email format.')).toBeTruthy();
    });
  });

  it('calls login function with correct credentials and navigates to Onboarding if user has no fitness data', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin.mockResolvedValueOnce(undefined),
      isLoading: false,
      error: null,
      user: mockUser, // User data available after successful login
    });

    const { getByLabelText, getByText } = render(
      <AuthProvider>
        <LoginScreen navigation={mockNavigation} route={{ key: 'Login', name: 'Login' }} />
      </AuthProvider>
    );

    fireEvent.changeText(getByLabelText('Email'), 'test@example.com');
    fireEvent.changeText(getByLabelText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockReplace).toHaveBeenCalledWith('Onboarding');
    });
  });

  it('calls login function and navigates to Home if user has fitness data', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin.mockResolvedValueOnce(undefined),
      isLoading: false,
      error: null,
      user: { ...mockUser, fitnessGoals: ['Lose Weight'], fitnessLevel: 'beginner' }, // User data with fitness info
    });

    const { getByLabelText, getByText } = render(
      <AuthProvider>
        <LoginScreen navigation={mockNavigation} route={{ key: 'Login', name: 'Login' }} />
      </AuthProvider>
    );

    fireEvent.changeText(getByLabelText('Email'), 'test@example.com');
    fireEvent.changeText(getByLabelText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockReplace).toHaveBeenCalledWith('Home');
    });
  });

  it('displays an alert on login failure', async () => {
    const errorMessage = 'Invalid credentials';
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin.mockRejectedValueOnce(new Error(errorMessage)),
      isLoading: false,
      error: errorMessage,
      user: null,
    });

    const { getByLabelText, getByText } = render(
      <AuthProvider>
        <LoginScreen navigation={mockNavigation} route={{ key: 'Login', name: 'Login' }} />
      </AuthProvider>
    );

    fireEvent.changeText(getByLabelText('Email'), 'wrong@example.com');
    fireEvent.changeText(getByLabelText('Password'), 'wrongpassword');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Login Failed', errorMessage);
    });
  });

  it('navigates to Register screen when "Register" link is pressed', () => {
    const { getByText } = render(
      <AuthProvider>
        <LoginScreen navigation={mockNavigation} route={{ key: 'Login', name: 'Login' }} />
      </AuthProvider>
    );

    fireEvent.press(getByText("Don't have an account? Register"));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('shows loading overlay when isLoading is true', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
      user: null,
    });

    const { getByText } = render(
      <AuthProvider>
        <LoginScreen navigation={mockNavigation} route={{ key: 'Login', name: 'Login' }} />
      </AuthProvider>
    );

    expect(getByText('Logging in...')).toBeTruthy();
  });
});
