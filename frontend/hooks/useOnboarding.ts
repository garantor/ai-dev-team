import { useState } from 'react';
import { Alert } from 'react-native';
import api from '../api';
import { useAuth } from './useAuth';

interface OnboardingData {
  fitnessGoals: string[];
  fitnessLevel: string;
}

export const useOnboarding = () => {
  const { user, updateUserProfile, updateUserOnboardingStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOnboarding = async (data: OnboardingData) => {
    setLoading(true);
    setError(null);
    try {
      // Assuming an API endpoint to update user profile with onboarding data
      const response = await api.put(`/users/${user?.id}/profile`, {
        fitnessGoals: data.fitnessGoals,
        fitnessLevel: data.fitnessLevel,
        onboardingComplete: true, // Mark onboarding as complete
      });

      // Update local user state with new profile data
      updateUserProfile({
        fitnessGoals: response.data.fitnessGoals,
        fitnessLevel: response.data.fitnessLevel,
        onboardingComplete: true,
      });
      updateUserOnboardingStatus(true);

      Alert.alert('Success', 'Onboarding complete! Welcome to the app.');
      return true;
    } catch (err: any) {
      console.error('Onboarding submission error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Failed to save onboarding data. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submitOnboarding,
  };
};
