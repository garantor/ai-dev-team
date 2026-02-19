import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Workout } from '../types/workout';
import { globalStyles } from '../styles/globalStyles';

interface WorkoutCardProps {
  workout: Workout;
  onPress: (workoutId: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onPress }) => {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <TouchableOpacity onPress={() => onPress(workout.id)} style={globalStyles.card} testID={`workout-card-${workout.id}`}>
      <Text style={globalStyles.cardTitle}>{workout.type}</Text>
      <Text style={globalStyles.cardText}>Date: {formatDate(workout.date)}</Text>
      <Text style={globalStyles.cardText}>Duration: {workout.duration} mins</Text>
      <Text style={globalStyles.cardText}>Calories Burned: {workout.caloriesBurned}</Text>
    </TouchableOpacity>
  );
};

export default WorkoutCard;
