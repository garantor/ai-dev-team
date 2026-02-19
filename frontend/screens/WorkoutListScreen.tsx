import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@types/workout';
import WorkoutCard from '@components/WorkoutCard';
import { globalStyles } from '@styles/globalStyles';
import { useWorkouts } from '@hooks/useWorkouts';

type WorkoutListScreenProps = StackScreenProps<RootStackParamList, 'WorkoutList'>;

const WorkoutListScreen: React.FC<WorkoutListScreenProps> = ({ navigation }) => {
  const { workouts, isLoading, error, fetchWorkouts } = useWorkouts();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchWorkouts(); // Refresh data when screen comes into focus
    });
    return unsubscribe;
  }, [navigation, fetchWorkouts]);

  const handleCardPress = useCallback((workoutId: string) => {
    navigation.navigate('WorkoutDetail', { workoutId });
  }, [navigation]);

  const handleAddWorkout = useCallback(() => {
    navigation.navigate('WorkoutLog');
  }, [navigation]);

  if (isLoading && workouts.length === 0) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading workouts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text style={globalStyles.errorText}>{error}</Text>
        <TouchableOpacity style={globalStyles.button} onPress={fetchWorkouts}>
          <Text style={globalStyles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Workout History</Text>
      {workouts.length === 0 && !isLoading ? (
        <Text style={globalStyles.emptyText}>No workouts logged yet. Tap '+' to add one!</Text>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <WorkoutCard workout={item} onPress={handleCardPress} />}
          contentContainerStyle={{ paddingBottom: 80 }} // Make space for FAB
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchWorkouts} colors={['#007bff']} />
          }
        />
      )}

      <TouchableOpacity style={globalStyles.fab} onPress={handleAddWorkout} testID="add-workout-fab">
        <Text style={globalStyles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WorkoutListScreen;
