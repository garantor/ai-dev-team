import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Mock @react-navigation/native
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
  }),
}));

// Mock useAuth hook
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockLogout = jest.fn();
const mockUpdateUserOnboardingStatus = jest.fn();
const mockUpdateUserProfile = jest.fn();

jest.mock('../hooks/useAuth', () => ({
  ...jest.requireActual('../hooks/useAuth'),
  useAuth: () => ({
    user: null,
    token: null,
    isLoading: false,
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    updateUserOnboardingStatus: mockUpdateUserOnboardingStatus,
    updateUserProfile: mockUpdateUserProfile,
  }),
}));

// Helper to wrap component with necessary providers
const Stack = createNativeStackNavigator();
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={() => component} />
          <Stack.Screen name="Register" component={() => <Text>Register Screen</Text>} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<LoginScreen />);

    expect(getByText('Welcome Back!')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
  });

  it('displays validation errors for empty fields', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<LoginScreen />);

    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Email is required.')).toBeTruthy();
      expect(getByText('Password is required.')).toBeTruthy();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays validation error for invalid email format', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'invalid-email');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid email format.')).toBeTruthy();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays validation error for short password', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'short');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Password must be at least 6 characters.')).toBeTruthy();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login function with correct credentials on valid input', async () => {
    mockLogin.mockResolvedValueOnce(undefined); // Simulate successful login

    const { getByText, getByPlaceholderText, queryByText } = renderWithProviders(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
    expect(queryByText('Email is required.')).toBeNull();
    expect(queryByText('Password is required.')).toBeNull();
  });

  it('navigates to Register screen when Register link is pressed', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);

    fireEvent.press(getByText('Register'));

    expect(mockReplace).toHaveBeenCalledWith('Register');
  });

  it('disables button when loading', () => {
    // Temporarily mock useAuth to return isLoading: true
    jest.mock('../hooks/useAuth', () => ({
      ...jest.requireActual('../hooks/useAuth'),
      useAuth: () => ({
        user: null,
        token: null,
        isLoading: true,
        login: mockLogin,
        register: mockRegister,
        logout: mockLogout,
        updateUserOnboardingStatus: mockUpdateUserOnboardingStatus,
        updateUserProfile: mockUpdateUserProfile,
      }),
    }));

    const { getByText } = renderWithProviders(<LoginScreen />);
    const loginButton = getByText('Login');
    expect(loginButton.props.accessibilityState.disabled).toBe(true);

    // Restore original mock after test
    jest.mock('../hooks/useAuth', () => ({
      ...jest.requireActual('../hooks/useAuth'),
      useAuth: () => ({
        user: null,
        token: null,
        isLoading: false,
        login: mockLogin,
        register: mockRegister,
        logout: mockLogout,
        updateUserOnboardingStatus: mockUpdateUserOnboardingStatus,
        updateUserProfile: mockUpdateUserProfile,
      }),
    }));
  });
});
