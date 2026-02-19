import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CustomButton from '@components/CustomButton';
import LoadingOverlay from '@components/LoadingOverlay';
import { globalStyles } from '@styles/globalStyles';
import { useAuth } from '@hooks/useAuth';
import { updateUserProfile } from '@services/authService';
import { User } from '@types/auth';

type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined; // Assuming a Home screen after onboarding
};

type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const fitnessGoalsOptions = [
  'Lose Weight',
  'Gain Muscle',
  'Improve Endurance',
  'Increase Flexibility',
  'Stress Reduction',
  'General Fitness',
];

const fitnessLevelOptions: Array<User['fitnessLevel']> = [
  'beginner', 'intermediate', 'advanced'
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(user?.fitnessGoals || []);
  const [selectedLevel, setSelectedLevel] = useState<User['fitnessLevel'] | undefined>(user?.fitnessLevel);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals((prevGoals) =>
      prevGoals.includes(goal) ? prevGoals.filter((g) => g !== goal) : [...prevGoals, goal]
    );
  };

  const validateInputs = () => {
    if (selectedGoals.length === 0) {
      setError('Please select at least one fitness goal.');
      return false;
    }
    if (!selectedLevel) {
      setError('Please select your fitness level.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSaveOnboarding = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUserProfile({
        fitnessGoals: selectedGoals,
        fitnessLevel: selectedLevel,
      });
      updateUser(updatedUser); // Update user in auth context
      Alert.alert('Success', 'Onboarding complete! Welcome to the app.', [
        { text: 'OK', onPress: () => navigation.replace('Home') },
      ]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save onboarding data. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <LoadingOverlay isVisible={isLoading} message="Saving your preferences..." />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.formContainer}>
          <Text style={globalStyles.title}>Tell Us About Yourself</Text>
          <Text style={styles.subtitle}>Help us personalize your fitness journey.</Text>

          {error && <Text style={globalStyles.errorText}>{error}</Text>}

          <Text style={globalStyles.sectionTitle}>What are your primary fitness goals?</Text>
          <View style={styles.goalsContainer}>
            {fitnessGoalsOptions.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalPill,
                  selectedGoals.includes(goal) && styles.goalPillSelected,
                ]}
                onPress={() => handleGoalToggle(goal)}
              >
                <Text
                  style={[
                    styles.goalText,
                    selectedGoals.includes(goal) && styles.goalTextSelected,
                  ]}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={globalStyles.sectionTitle}>What is your current fitness level?</Text>
          <View style={globalStyles.radioGroup}>
            {fitnessLevelOptions.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  globalStyles.radioOption,
                  selectedLevel === level && globalStyles.radioOptionSelected,
                ]}
                onPress={() => setSelectedLevel(level)}
              >
                <Text
                  style={[
                    globalStyles.radioText,
                    selectedLevel === level && globalStyles.radioTextSelected,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <CustomButton
            title="Complete Onboarding"
            onPress={handleSaveOnboarding}
            loading={isLoading}
            disabled={isLoading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  goalPill: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 5,
  },
  goalPillSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  goalText: {
    color: '#555',
    fontSize: 15,
  },
  goalTextSelected: {
    color: '#fff',
  },
  saveButton: {
    marginTop: 30,
  },
});

export default OnboardingScreen;
