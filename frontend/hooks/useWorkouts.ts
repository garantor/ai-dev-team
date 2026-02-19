import { useState, useEffect, useCallback } from 'react';
import { Workout } from '../types/workout';
import { getWorkouts, createWorkout, updateWorkout, deleteWorkout } from '../api/workoutApi';
import { Alert } from 'react-native';

interface UseWorkoutsResult {
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;
  fetchWorkouts: () => Promise<void>;
  addWorkout: (newWorkout: Omit<Workout, 'id' | 'date'>) => Promise<void>;
  updateExistingWorkout: (id: string, updatedFields: Partial<Omit<Workout, 'id' | 'date'>>) => Promise<void>;
  removeWorkout: (id: string) => Promise<void>;
}

export const useWorkouts = (): UseWorkoutsResult => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWorkouts();
      // Sort by date descending
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setWorkouts(sortedData);
    } catch (err: any) {
      console.error('Failed to fetch workouts:', err);
      setError(err.message || 'Failed to load workouts.');
      Alert.alert('Error', err.response?.message || 'Failed to load workouts.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addWorkout = useCallback(async (newWorkout: Omit<Workout, 'id' | 'date'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const createdWorkout = await createWorkout(newWorkout);
      setWorkouts(prev => [createdWorkout, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      Alert.alert('Success', 'Workout logged successfully!');
    } catch (err: any) {
      console.error('Failed to add workout:', err);
      setError(err.message || 'Failed to add workout.');
      Alert.alert('Error', err.response?.message || 'Failed to log workout. Please check your input.');
      throw err; // Re-throw to allow screen to handle navigation
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateExistingWorkout = useCallback(async (id: string, updatedFields: Partial<Omit<Workout, 'id' | 'date'>>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedWorkout = await updateWorkout(id, updatedFields);
      setWorkouts(prev =>
        prev.map(w => (w.id === id ? { ...w, ...updatedWorkout } : w))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      Alert.alert('Success', 'Workout updated successfully!');
    } catch (err: any) {
      console.error('Failed to update workout:', err);
      setError(err.message || 'Failed to update workout.');
      Alert.alert('Error', err.response?.message || 'Failed to update workout. Please try again.');
      throw err; // Re-throw to allow screen to handle navigation
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeWorkout = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteWorkout(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
      Alert.alert('Success', 'Workout deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete workout:', err);
      setError(err.message || 'Failed to delete workout.');
      Alert.alert('Error', err.response?.message || 'Failed to delete workout. Please try again.');
      throw err; // Re-throw to allow screen to handle navigation
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return {
    workouts,
    isLoading,
    error,
    fetchWorkouts,
    addWorkout,
    updateExistingWorkout,
    removeWorkout,
  };
};
