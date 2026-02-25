import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp, NativeStackNavigationProp } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import { getWorkoutById, updateWorkout } from '../utils/api';
import { RootStackParamList, WorkoutFormData } from '../types';
import LoadingOverlay from '../components/LoadingOverlay';
import ErrorMessage from '../components/ErrorMessage';

type WorkoutEditScreenRouteProp = RouteProp<RootStackParamList, 'WorkoutEdit'>;
type WorkoutEditScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkoutEdit'>;

const WorkoutEditScreen: React.FC = () => {
  const navigation = useNavigation<WorkoutEditScreenNavigationProp>();
  const route = useRoute<WorkoutEditScreenRouteProp>();
  const { workoutId } = route.params;

  const [workoutType, setWorkoutType] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [caloriesBurned, setCaloriesBurned] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initial loading for fetching data
  const [isSaving, setIsSaving] = useState<boolean>(false); // Loading for saving changes
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedWorkout = await getWorkoutById(workoutId);
        setWorkoutType(fetchedWorkout.type);
        setDuration(fetchedWorkout.duration.toString());
        setCaloriesBurned(fetchedWorkout.caloriesBurned.toString());
        setNotes(fetchedWorkout.notes || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load workout data for editing.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkoutData();
  }, [workoutId]);

  const validateInputs = (): boolean => {
    if (!workoutType.trim()) {
      setError('Workout type is required.');
      return false;
    }
    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      setError('Duration must be a positive number.');
      return false;
    }
    const parsedCalories = parseInt(caloriesBurned);
    if (isNaN(parsedCalories) || parsedCalories <= 0) {
      setError('Calories burned must be a positive number.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    const workoutData: WorkoutFormData = {
      type: workoutType.trim(),
      duration: parseInt(duration),
      caloriesBurned: parseInt(caloriesBurned),
      notes: notes.trim() || undefined,
    };

    try {
      await updateWorkout(workoutId, workoutData);
      Alert.alert('Success', 'Workout updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to update workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading workout data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container} keyboardShouldPersistTaps="handled">
      <Text style={globalStyles.title}>Edit Workout</Text>

      <Text style={globalStyles.label}>Workout Type:</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g., Running, Weightlifting, Yoga"
        value={workoutType}
        onChangeText={setWorkoutType}
        autoCapitalize="words"
      />

      <Text style={globalStyles.label}>Duration (minutes):</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g., 30, 60"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
      />

      <Text style={globalStyles.label}>Calories Burned:</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g., 200, 500"
        value={caloriesBurned}
        onChangeText={setCaloriesBurned}
        keyboardType="numeric"
      />

      <Text style={globalStyles.label}>Notes (optional):</Text>
      <TextInput
        style={globalStyles.textArea}
        placeholder="Any specific details or feelings?"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <ErrorMessage message={error} />

      <TouchableOpacity style={globalStyles.button} onPress={handleSave} disabled={isSaving}>
        <Text style={globalStyles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <LoadingOverlay isLoading={isSaving} />
    </ScrollView>
  );
};

export default WorkoutEditScreen;
