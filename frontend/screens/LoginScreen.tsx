import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CustomInput from '@components/CustomInput';
import CustomButton from '@components/CustomButton';
import LoadingOverlay from '@components/LoadingOverlay';
import { globalStyles } from '@styles/globalStyles';
import { useAuth } from '@hooks/useAuth';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Home: undefined; // Assuming a Home screen after onboarding
};

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, isLoading, error, user } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateInputs = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError('Invalid email format.');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      await login({ email, password });
      // Check if user has completed onboarding
      if (user?.fitnessGoals && user?.fitnessLevel) {
        navigation.replace('Home'); // Navigate to main app if onboarding done
      } else {
        navigation.replace('Onboarding'); // Navigate to onboarding if not done
      }
    } catch (err: any) {
      // Error is already set by useAuth hook, display via Alert or Text component
      Alert.alert('Login Failed', error || 'An unexpected error occurred.');
    }
  };

  return (
    <View style={globalStyles.container}>
      <LoadingOverlay isVisible={isLoading} message="Logging in..." />
      <View style={globalStyles.formContainer}>
        <Text style={globalStyles.title}>Login</Text>

        {error && <Text style={globalStyles.errorText}>{error}</Text>}

        <CustomInput
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          error={emailError}
        />
        <CustomInput
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={passwordError}
        />

        <CustomButton
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={globalStyles.linkText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
