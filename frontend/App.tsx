import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OnboardingGoalsScreen from './screens/OnboardingGoalsScreen';
import OnboardingLevelScreen from './screens/OnboardingLevelScreen';
import HomeScreen from './screens/HomeScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoadingOverlay from './components/LoadingOverlay';
import { StatusBar } from 'expo-status-bar';
import WorkoutHistoryScreen from './screens/WorkoutHistoryScreen';
import WorkoutLogScreen from './screens/WorkoutLogScreen';
import WorkoutDetailScreen from './screens/WorkoutDetailScreen';
import WorkoutEditScreen from './screens/WorkoutEditScreen';
import { RootStackParamList } from './types'; // This type defines the workout screens

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

// AppStackParamList now includes a route for the WorkoutNavigator
type AppStackParamList = {
  Home: undefined;
  OnboardingGoals: undefined;
  OnboardingLevel: undefined;
  WorkoutNavigator: undefined; // Route to the nested workout navigator
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const WorkoutStack = createNativeStackNavigator<RootStackParamList>(); // Renamed from 'Stack' to avoid conflict

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// New component for the workout-related screens
const WorkoutNavigator = () => (
  <WorkoutStack.Navigator initialRouteName="WorkoutHistory">
    <WorkoutStack.Screen
      name="WorkoutHistory"
      component={WorkoutHistoryScreen}
      options={{ title: 'Workout History' }}
    />
    <WorkoutStack.Screen
      name="WorkoutLog"
      component={WorkoutLogScreen}
      options={{ title: 'Log New Workout' }}
    />
    <WorkoutStack.Screen
      name="WorkoutDetail"
      component={WorkoutDetailScreen}
      options={{ title: 'Workout Details' }}
    />
    <WorkoutStack.Screen
      name="WorkoutEdit"
      component={WorkoutEditScreen}
      options={{ title: 'Edit Workout' }}
    />
  </WorkoutStack.Navigator>
);

const AppNavigator = () => {
  const { user } = useAuth();

  // Determine initial route based on onboarding status
  const initialRouteName: keyof AppStackParamList =
    user?.onboardingComplete ? 'Home' : 'OnboardingGoals';

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <AppStack.Screen name="OnboardingGoals" component={OnboardingGoalsScreen} />
      <AppStack.Screen name="OnboardingLevel" component={OnboardingLevelScreen} />
      <AppStack.Screen name="Home" component={HomeScreen} />
      {/* Add the WorkoutNavigator as a screen within the AppStack */}
      <AppStack.Screen name="WorkoutNavigator" component={WorkoutNavigator} options={{ headerShown: false }} />
    </AppStack.Navigator>
  );
};

const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay message="Loading user session..." />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const App = () => (
  <AuthProvider>
    <RootNavigator />
  </AuthProvider>
);

export default App;