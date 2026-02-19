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
};

type RegistrationScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
  const { register, isLoading, error } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [university, setUniversity] = useState<string>('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [universityError, setUniversityError] = useState<string | null>(null);

  const validateInputs = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setNameError(null);
    setUniversityError(null);

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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    if (!name.trim()) {
      setNameError('Name is required.');
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
      await register({ email, password, name, university });
      navigation.replace('Onboarding'); // Navigate to onboarding after successful registration
    } catch (err: any) {
      Alert.alert('Registration Failed', error || 'An unexpected error occurred.');
    }
  };

  return (
    <View style={globalStyles.container}>
      <LoadingOverlay isVisible={isLoading} message="Registering..." />
      <View style={globalStyles.formContainer}>
        <Text style={globalStyles.title}>Register</Text>

        {error && <Text style={globalStyles.errorText}>{error}</Text>}

        <CustomInput
          label="Name"
          placeholder="Enter your full name"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
          error={nameError}
        />
        <CustomInput
          label="University"
          placeholder="Enter your university name"
          autoCapitalize="words"
          value={university}
          onChangeText={setUniversity}
          error={universityError}
        />
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
          placeholder="Create a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={passwordError}
        />
        <CustomInput
          label="Confirm Password"
          placeholder="Confirm your password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={confirmPasswordError}
        />

        <CustomButton
          title="Register"
          onPress={handleRegister}
          loading={isLoading}
          disabled={isLoading}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={globalStyles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegistrationScreen;
