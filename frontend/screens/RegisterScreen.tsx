import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, TouchableOpacity, ScrollView } from 'react-native';
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

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [universityError, setUniversityError] = useState<string | null>(null);

  const validateInputs = () => {
    let isValid = true;
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setUniversityError(null);

    if (!name.trim()) {
      setNameError('Name is required.');
      isValid = false;
    }

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

    if (!university.trim()) {
      setUniversityError('University is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      await register(email, password, name, university);
      // Navigation handled by App.tsx based on auth state
    } catch (error) {
      // Error message already displayed by useAuth hook
      console.error('Registration failed in component:', error);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        <View style={commonStyles.authContent}>
          <Text style={commonStyles.authTitle}>Create Account</Text>
          <Text style={commonStyles.authSubtitle}>Join us to start your fitness journey!</Text>

          <Input
            label="Full Name"
            placeholder="Enter your full name"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
            error={nameError}
            onBlur={() => setNameError(null)}
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            onBlur={() => setEmailError(null)}
          />
          <Input
            label="Password"
            placeholder="Create a password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            onBlur={() => setPasswordError(null)}
          />
          <Input
            label="University (Optional)"
            placeholder="e.g., University of Example"
            autoCapitalize="words"
            value={university}
            onChangeText={setUniversity}
            error={universityError}
            onBlur={() => setUniversityError(null)}
          />

          <Button
            title="Register"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={commonStyles.authButton}
          />

          <View style={commonStyles.authFooter}>
            <Text style={commonStyles.authFooterText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')} disabled={isLoading}>
              <Text style={commonStyles.authFooterLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
