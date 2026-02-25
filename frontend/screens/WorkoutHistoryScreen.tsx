import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect, NativeStackNavigationProp } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import { getWorkouts } from '../utils/api';
import { Workout, RootStackParamList } from '../types';
import WorkoutCard from '../components/WorkoutCard';
import ErrorMessage from '../components/ErrorMessage';

type WorkoutHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkoutHistory'>;

const WorkoutHistoryScreen: React.FC = () => {
  const navigation = useNavigation<WorkoutHistoryScreenNavigationProp>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    setError(null);
    try {
      const fetchedWorkouts = await getWorkouts();
      setWorkouts(fetchedWorkouts);
    } catch (err: any) {
      setError(err.message || 'Failed to load workouts.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchWorkouts();
    }, [fetchWorkouts])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchWorkouts();
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading workouts...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <ErrorMessage message={error} />

      {workouts.length === 0 && !error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#555', marginBottom: 20 }}>No workouts logged yet.</Text>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => navigation.navigate('WorkoutLog')}
          >
            <Text style={globalStyles.buttonText}>Log Your First Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <WorkoutCard workout={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#007bff']} />
          }
        />
      )}

      <TouchableOpacity
        style={[
          globalStyles.button,
          { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
        ]}
        onPress={() => navigation.navigate('WorkoutLog')}
      >
        <Text style={[globalStyles.buttonText, { fontSize: 30, lineHeight: 30 }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WorkoutHistoryScreen;
