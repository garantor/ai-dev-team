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

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

type AppStackParamList = {
  Home: undefined;
  OnboardingGoals: undefined;
  OnboardingLevel: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
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
