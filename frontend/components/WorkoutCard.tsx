import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Workout } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type WorkoutCardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkoutHistory'>;

interface WorkoutCardProps {
  workout: Workout;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout }) => {
  const navigation = useNavigation<WorkoutCardNavigationProp>();

  const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePress = () => {
    navigation.navigate('WorkoutDetail', { workoutId: workout.id });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.type}>{workout.type}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detailText}>Duration: {workout.duration} mins</Text>
        <Text style={styles.detailText}>Calories Burned: {workout.caloriesBurned}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  type: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#777',
  },
  details: {
    marginTop: 5,
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
});

export default WorkoutCard;
