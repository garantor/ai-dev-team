import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../components/Button';
import { commonStyles } from '../styles/commonStyles';
import { theme } from '../styles/theme';

type AppStackParamList = {
  OnboardingGoals: undefined;
  OnboardingLevel: undefined;
  Home: undefined;
};

type OnboardingGoalsScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'OnboardingGoals'>;

const fitnessGoals = [
  'Lose Weight',
  'Build Muscle',
  'Improve Endurance',
  'Increase Flexibility',
  'Reduce Stress',
  'Improve Overall Health',
  'Train for an Event',
];

const OnboardingGoalsScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingGoalsScreenNavigationProp>();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleNext = () => {
    if (selectedGoals.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one fitness goal.');
      return;
    }
    navigation.navigate('OnboardingLevel', { fitnessGoals: selectedGoals });
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={commonStyles.authContent}>
          <Text style={commonStyles.authTitle}>What are your fitness goals?</Text>
          <Text style={commonStyles.authSubtitle}>Select all that apply.</Text>

          <View style={styles.goalsContainer}>
            {fitnessGoals.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalChip,
                  selectedGoals.includes(goal) && styles.goalChipSelected,
                ]}
                onPress={() => toggleGoal(goal)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.goalChipText,
                    selectedGoals.includes(goal) && styles.goalChipTextSelected,
                  ]}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Next"
            onPress={handleNext}
            style={commonStyles.authButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: theme.spacing.large * 2,
    width: '100%',
  },
  goalChip: {
    backgroundColor: theme.colors.grayLight,
    borderRadius: theme.borderRadius.large,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    margin: theme.spacing.xsmall,
    borderWidth: 1,
    borderColor: theme.colors.grayLight,
  },
  goalChipSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  goalChipText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.medium,
    fontWeight: '500',
  },
  goalChipTextSelected: {
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
});

export default OnboardingGoalsScreen;
