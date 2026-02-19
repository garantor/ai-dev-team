import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import WorkoutListScreen from './screens/WorkoutListScreen';
import WorkoutDetailScreen from './screens/WorkoutDetailScreen';
import WorkoutLogScreen from './screens/WorkoutLogScreen';
import { RootStackParamList } from './types/workout';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WorkoutList">
        <Stack.Screen
          name="WorkoutList"
          component={WorkoutListScreen}
          options={{ title: 'My Workouts' }}
        />
        <Stack.Screen
          name="WorkoutDetail"
          component={WorkoutDetailScreen}
          options={{ title: 'Workout Details' }}
        />
        <Stack.Screen
          name="WorkoutLog"
          component={WorkoutLogScreen}
          options={({ route }) => ({ title: route.params?.workoutId ? 'Edit Workout' : 'Log Workout' })}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
