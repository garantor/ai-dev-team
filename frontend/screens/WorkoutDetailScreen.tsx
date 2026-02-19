import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Workout, RootStackParamList } from '../types/workout';
import { getWorkoutById } from '../api/workoutApi';
import { globalStyles } from '../styles/globalStyles';
import { useWorkouts } from '../hooks/useWorkouts';

type WorkoutDetailScreenProps = StackScreenProps<RootStackParamList, 'WorkoutDetail'>;

const WorkoutDetailScreen: React.FC<WorkoutDetailScreenProps> = ({ navigation, route }) => {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { removeWorkout, isLoading: isDeleting } = useWorkouts();

  const fetchWorkoutDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWorkoutById(workoutId);
      setWorkout(data);
    } catch (err: any) {
      console.error('Failed to fetch workout details:', err);
      setError(err.message || 'Failed to load workout details.');
      Alert.alert('Error', err.response?.message || 'Failed to load workout details.');
      navigation.goBack(); // Go back if workout not found or error
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchWorkoutDetails(); // Refresh data when screen comes into focus
    });
    return unsubscribe;
  }, [navigation, fetchWorkoutDetails]);

  const handleEdit = useCallback(() => {
    navigation.navigate('WorkoutLog', { workoutId: workout?.id });
  }, [navigation, workout]);

  const handleDelete = useCallback(() => {
    if (!workout) return;

    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete your ${workout.type} workout on ${new Date(workout.date).toLocaleDateString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeWorkout(workout.id);
              navigation.goBack(); // Go back to list after successful deletion
            } catch (err) {
              // Error handled by useWorkouts hook, Alert already shown
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [workout, navigation, removeWorkout]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) +
           ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading workout details...</Text>
      </View>
    );
  }

  if (error || !workout) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text style={globalStyles.errorText}>{error || 'Workout not found.'}</Text>
        <TouchableOpacity style={globalStyles.button} onPress={() => navigation.goBack()}>
          <Text style={globalStyles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>{workout.type} Workout</Text>

      <View style={styles.detailCard}>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>Date:</Text> {formatDate(workout.date)}</Text>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>Duration:</Text> {workout.duration} minutes</Text>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>Calories Burned:</Text> {workout.caloriesBurned}</Text>
        {workout.notes && <Text style={styles.detailText}><Text style={styles.detailLabel}>Notes:</Text> {workout.notes}</Text>}
      </View>

      <TouchableOpacity
        style={globalStyles.button}
        onPress={handleEdit}
        testID="edit-workout-button"
      >
        <Text style={globalStyles.buttonText}>Edit Workout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.dangerButton, isDeleting && styles.disabledButton]}
        onPress={handleDelete}
        disabled={isDeleting}
        testID="delete-workout-button"
      >
        {isDeleting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={globalStyles.buttonText}>Delete Workout</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  detailCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  detailText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default WorkoutDetailScreen;
