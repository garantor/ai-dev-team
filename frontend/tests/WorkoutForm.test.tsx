import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WorkoutForm from '../components/WorkoutForm';

describe('WorkoutForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders correctly in create mode', () => {
    const { getByText, getByPlaceholderText } = render(
      <WorkoutForm onSubmit={mockOnSubmit} isLoading={false} />
    );

    expect(getByText('Log New Workout')).toBeTruthy();
    expect(getByPlaceholderText('Workout Type (e.g., Running, Weightlifting)')).toBeTruthy();
    expect(getByText('Log Workout')).toBeTruthy();
  });

  it('renders correctly in edit mode with initial data', () => {
    const initialData = {
      id: '1',
      type: 'Running',
      duration: 30,
      caloriesBurned: 300,
      notes: 'Morning run',
      date: '2023-01-01T10:00:00Z',
    };
    const { getByText, getByDisplayValue } = render(
      <WorkoutForm initialData={initialData} onSubmit={mockOnSubmit} isLoading={false} isEditMode={true} />
    );

    expect(getByText('Edit Workout')).toBeTruthy();
    expect(getByDisplayValue('Running')).toBeTruthy();
    expect(getByDisplayValue('30')).toBeTruthy();
    expect(getByDisplayValue('300')).toBeTruthy();
    expect(getByDisplayValue('Morning run')).toBeTruthy();
    expect(getByText('Save Changes')).toBeTruthy();
  });

  it('shows validation errors for empty type', async () => {
    const { getByText, getByTestId } = render(
      <WorkoutForm onSubmit={mockOnSubmit} isLoading={false} />
    );

    fireEvent.press(getByTestId('workout-submit-button'));

    await waitFor(() => {
      expect(getByText('Workout type is required.')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation errors for invalid duration', async () => {
    const { getByText, getByTestId } = render(
      <WorkoutForm onSubmit={mockOnSubmit} isLoading={false} />
    );

    fireEvent.changeText(getByTestId('workout-type-input'), 'Yoga');
    fireEvent.changeText(getByTestId('workout-duration-input'), '-10');
    fireEvent.changeText(getByTestId('workout-calories-input'), '100');

    fireEvent.press(getByTestId('workout-submit-button'));

    await waitFor(() => {
      expect(getByText('Duration must be a positive number.')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid data successfully', async () => {
    const { getByText, getByTestId } = render(
      <WorkoutForm onSubmit={mockOnSubmit} isLoading={false} />
    );

    fireEvent.changeText(getByTestId('workout-type-input'), 'Cycling');
    fireEvent.changeText(getByTestId('workout-duration-input'), '60');
    fireEvent.changeText(getByTestId('workout-calories-input'), '500');
    fireEvent.changeText(getByTestId('workout-notes-input'), 'Evening ride');

    fireEvent.press(getByTestId('workout-submit-button'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        type: 'Cycling',
        duration: 60,
        caloriesBurned: 500,
        notes: 'Evening ride',
      });
    });
  });

  it('disables button when loading', () => {
    const { getByTestId } = render(
      <WorkoutForm onSubmit={mockOnSubmit} isLoading={true} />
    );

    expect(getByTestId('workout-submit-button')).toBeDisabled();
  });
});
