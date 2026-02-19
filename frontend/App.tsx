import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from '@hooks/useAuth';
import WelcomeScreen from '@screens/WelcomeScreen';
import LoginScreen from '@screens/LoginScreen';
import RegistrationScreen from '@screens/RegistrationScreen';
import OnboardingScreen from '@screens/OnboardingScreen';
import HomeScreen from '@screens/HomeScreen'; // Assuming a main app screen after onboarding
import LoadingOverlay from '@components/LoadingOverlay';
import { StatusBar } from 'expo-status-bar';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { token, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingOverlay isVisible={true} message="Loading app..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        // User is logged in
        user?.fitnessGoals && user?.fitnessLevel ? (
          // Onboarding is complete
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          // Onboarding is not complete
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )
      ) : (
        // User is not logged in
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegistrationScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
