import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { commonStyles } from '../styles/commonStyles';
import { theme } from '../styles/theme';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Welcome: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateInputs = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError('Invalid email format.');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      await login(email, password);
      // Navigation handled by App.tsx based on auth state
    } catch (error) {
      // Error message already displayed by useAuth hook
      console.error('Login failed in component:', error);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.authContent}>
        <Text style={commonStyles.authTitle}>Welcome Back!</Text>
        <Text style={commonStyles.authSubtitle}>Log in to continue your fitness journey.</Text>

        <Input
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          onBlur={() => setEmailError(null)} // Clear error on blur
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          onBlur={() => setPasswordError(null)} // Clear error on blur
        />

        <Button
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          style={commonStyles.authButton}
        />

        <View style={commonStyles.authFooter}>
          <Text style={commonStyles.authFooterText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.replace('Register')} disabled={isLoading}>
            <Text style={commonStyles.authFooterLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
