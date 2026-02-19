import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Workout, RootStackParamList } from '../types/workout';
import WorkoutForm from '../components/WorkoutForm';
import { getWorkoutById } from '../api/workoutApi';
import { globalStyles } from '../styles/globalStyles';
import { useWorkouts } from '../hooks/useWorkouts';

type WorkoutLogScreenProps = StackScreenProps<RootStackParamList, 'WorkoutLog'>;

const WorkoutLogScreen: React.FC<WorkoutLogScreenProps> = ({ navigation, route }) => {
  const workoutId = route.params?.workoutId;
  const isEditMode = !!workoutId;

  const [initialWorkoutData, setInitialWorkoutData] = useState<Workout | undefined>(undefined);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  const { addWorkout, updateExistingWorkout, isLoading: isSubmitting } = useWorkouts();

  const fetchWorkoutDetails = useCallback(async () => {
    if (workoutId) {
      setIsLoadingInitialData(true);
      setError(null);
      try {
        const data = await getWorkoutById(workoutId);
        setInitialWorkoutData(data);
      } catch (err: any) {
        console.error('Failed to fetch workout for edit:', err);
        setError(err.message || 'Failed to load workout details for editing.');
        Alert.alert('Error', err.response?.message || 'Failed to load workout details.');
        navigation.goBack(); // Go back if workout not found or error
      } finally {
        setIsLoadingInitialData(false);
      }
    }
  }, [workoutId]);

  useEffect(() => {
    if (isEditMode) {
      fetchWorkoutDetails();
    }
  }, [isEditMode, fetchWorkoutDetails]);

  const handleSubmit = async (data: Omit<Workout, 'id' | 'date'>) => {
    try {
      if (isEditMode && workoutId) {
        await updateExistingWorkout(workoutId, data);
      } else {
        await addWorkout(data);
      }
      navigation.goBack();
    } catch (err) {
      // Error handled by useWorkouts hook, just prevent navigation here if needed
      console.log('Submission failed, staying on screen.');
    }
  };

  if (isLoadingInitialData) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading workout...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text style={globalStyles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <WorkoutForm
      initialData={initialWorkoutData}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      isEditMode={isEditMode}
    />
  );
};

export default WorkoutLogScreen;
