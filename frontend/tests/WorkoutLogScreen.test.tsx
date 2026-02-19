import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WorkoutLogScreen from '../screens/WorkoutLogScreen';
import * as api from '../utils/api';
import { Alert } from 'react-native';

// Mock react-navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({ params: {} }),
}));

// Mock API calls
jest.mock('../utils/api', () => ({
  createWorkout: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('WorkoutLogScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all input fields and button', () => {
    const { getByPlaceholderText, getByText } = render(<WorkoutLogScreen />);

    expect(getByPlaceholderText('e.g., Running, Weightlifting, Yoga')).toBeTruthy();
    expect(getByPlaceholderText('e.g., 30, 60')).toBeTruthy();
    expect(getByPlaceholderText('e.g., 200, 500')).toBeTruthy();
    expect(getByPlaceholderText('Any specific details or feelings?')).toBeTruthy();
    expect(getByText('Log Workout')).toBeTruthy();
  });

  it('shows error messages for invalid input', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<WorkoutLogScreen />);

    // Try to submit with empty fields
    fireEvent.press(getByText('Log Workout'));
    expect(getByText('Workout type is required.')).toBeTruthy();

    // Fill type, but invalid duration
    fireEvent.changeText(getByPlaceholderText('e.g., Running, Weightlifting, Yoga'), 'Running');
    fireEvent.changeText(getByPlaceholderText('e.g., 30, 60'), 'abc');
    fireEvent.press(getByText('Log Workout'));
    expect(queryByText('Workout type is required.')).toBeNull(); // Old error should be gone
    expect(getByText('Duration must be a positive number.')).toBeTruthy();

    // Fill duration, but invalid calories
    fireEvent.changeText(getByPlaceholderText('e.g., 30, 60'), '30');
    fireEvent.changeText(getByPlaceholderText('e.g., 200, 500'), '-50');
    fireEvent.press(getByText('Log Workout'));
    expect(queryByText('Duration must be a positive number.')).toBeNull();
    expect(getByText('Calories burned must be a positive number.')).toBeTruthy();

    // All valid
    fireEvent.changeText(getByPlaceholderText('e.g., 200, 500'), '250');
    fireEvent.press(getByText('Log Workout'));
    expect(queryByText('Calories burned must be a positive number.')).toBeNull();
    // No error message should be visible now, and API call should be attempted
    await waitFor(() => expect(api.createWorkout).toHaveBeenCalled());
  });

  it('calls createWorkout API and navigates back on successful submission', async () => {
    const { getByText, getByPlaceholderText } = render(<WorkoutLogScreen />);

    (api.createWorkout as jest.Mock).mockResolvedValueOnce({
      id: '123',
      type: 'Running',
      duration: 30,
      caloriesBurned: 250,
      date: new Date().toISOString(),
    });

    fireEvent.changeText(getByPlaceholderText('e.g., Running, Weightlifting, Yoga'), 'Running');
    fireEvent.changeText(getByPlaceholderText('e.g., 30, 60'), '30');
    fireEvent.changeText(getByPlaceholderText('e.g., 200, 500'), '250');
    fireEvent.changeText(getByPlaceholderText('Any specific details or feelings?'), 'Felt great!');

    fireEvent.press(getByText('Log Workout'));

    await waitFor(() => {
      expect(api.createWorkout).toHaveBeenCalledWith({
        type: 'Running',
        duration: 30,
        caloriesBurned: 250,
        notes: 'Felt great!',
      });
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Workout logged successfully!',
        expect.any(Array)
      );
      // Simulate pressing 'OK' on the alert
      (Alert.alert as jest.Mock).mock.calls[0][2][0].onPress();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('displays an error message if API call fails', async () => {
    const { getByText, getByPlaceholderText } = render(<WorkoutLogScreen />);

    const errorMessage = 'Network error, please try again.';
    (api.createWorkout as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    fireEvent.changeText(getByPlaceholderText('e.g., Running, Weightlifting, Yoga'), 'Running');
    fireEvent.changeText(getByPlaceholderText('e.g., 30, 60'), '30');
    fireEvent.changeText(getByPlaceholderText('e.g., 200, 500'), '250');

    fireEvent.press(getByText('Log Workout'));

    await waitFor(() => {
      expect(api.createWorkout).toHaveBeenCalled();
      expect(getByText(errorMessage)).toBeTruthy();
      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });

  it('disables the button while loading', async () => {
    const { getByText, getByPlaceholderText } = render(<WorkoutLogScreen />);

    (api.createWorkout as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    fireEvent.changeText(getByPlaceholderText('e.g., Running, Weightlifting, Yoga'), 'Running');
    fireEvent.changeText(getByPlaceholderText('e.g., 30, 60'), '30');
    fireEvent.changeText(getByPlaceholderText('e.g., 200, 500'), '250');

    const logButton = getByText('Log Workout');
    fireEvent.press(logButton);

    expect(logButton).toBeDisabled();

    await waitFor(() => expect(api.createWorkout).toHaveBeenCalled());
    expect(logButton).not.toBeDisabled(); // Should be re-enabled after API call completes
  });
});
