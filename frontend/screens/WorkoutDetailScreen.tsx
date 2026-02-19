import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp, NativeStackNavigationProp, useFocusEffect } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import { getWorkoutById, deleteWorkout } from '../utils/api';
import { RootStackParamList, Workout } from '../types';
import ErrorMessage from '../components/ErrorMessage';

type WorkoutDetailScreenRouteProp = RouteProp<RootStackParamList, 'WorkoutDetail'>;
type WorkoutDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkoutDetail'>;

const WorkoutDetailScreen: React.FC = () => {
  const route = useRoute<WorkoutDetailScreenRouteProp>();
  const navigation = useNavigation<WorkoutDetailScreenNavigationProp>();
  const { workoutId } = route.params;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkoutDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedWorkout = await getWorkoutById(workoutId);
      setWorkout(fetchedWorkout);
    } catch (err: any) {
      setError(err.message || 'Failed to load workout details.');
    } finally {
      setIsLoading(false);
    }
  }, [workoutId]);

  useFocusEffect(
    useCallback(() => {
      fetchWorkoutDetails();
    }, [fetchWorkoutDetails])
  );

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            setError(null);
            try {
              await deleteWorkout(workoutId);
              Alert.alert('Success', 'Workout deleted successfully!');
              navigation.goBack(); // Go back to history screen
            } catch (err: any) {
              setError(err.message || 'Failed to delete workout.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading workout details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.container}>
        <ErrorMessage message={error} />
        <TouchableOpacity style={globalStyles.button} onPress={fetchWorkoutDetails}>
          <Text style={globalStyles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={globalStyles.container}>
        <Text style={globalStyles.errorText}>Workout not found.</Text>
      </View>
    );
  }

  const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>{workout.type}</Text>
        <Text style={styles.detailLabel}>Date: <Text style={styles.detailValue}>{formattedDate}</Text></Text>
        <Text style={styles.detailLabel}>Duration: <Text style={styles.detailValue}>{workout.duration} minutes</Text></Text>
        <Text style={styles.detailLabel}>Calories Burned: <Text style={styles.detailValue}>{workout.caloriesBurned}</Text></Text>
        {workout.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.detailValue}>{workout.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[globalStyles.button, styles.editButton]}
          onPress={() => navigation.navigate('WorkoutEdit', { workoutId: workout.id })}
        >
          <Text style={globalStyles.buttonText}>Edit Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={globalStyles.buttonText}>Delete Workout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333',
  },
  notesContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  editButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#28a745',
  },
  deleteButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#dc3545',
  },
});

export default WorkoutDetailScreen;
