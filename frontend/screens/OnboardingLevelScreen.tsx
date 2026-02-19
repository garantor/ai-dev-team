import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Button from '../components/Button';
import { commonStyles } from '../styles/commonStyles';
import { theme } from '../styles/theme';
import { useOnboarding } from '../hooks/useOnboarding';

type AppStackParamList = {
  OnboardingGoals: { fitnessGoals: string[] };
  OnboardingLevel: { fitnessGoals: string[] };
  Home: undefined;
};

type OnboardingLevelScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'OnboardingLevel'>;
type OnboardingLevelScreenRouteProp = RouteProp<AppStackParamList, 'OnboardingLevel'>;

const fitnessLevels = [
  'Beginner (Just starting out)',
  'Intermediate (Some experience)',
  'Advanced (Experienced athlete)',
];

const OnboardingLevelScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingLevelScreenNavigationProp>();
  const route = useRoute<OnboardingLevelScreenRouteProp>();
  const { fitnessGoals } = route.params;

  const { submitOnboarding, loading, error } = useOnboarding();

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleFinish = async () => {
    if (!selectedLevel) {
      Alert.alert('Selection Required', 'Please select your current fitness level.');
      return;
    }

    const success = await submitOnboarding({
      fitnessGoals: fitnessGoals,
      fitnessLevel: selectedLevel,
    });

    if (success) {
      navigation.replace('Home');
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={commonStyles.authContent}>
          <Text style={commonStyles.authTitle}>What's your current fitness level?</Text>
          <Text style={commonStyles.authSubtitle}>This helps us tailor your experience.</Text>

          <View style={styles.levelsContainer}>
            {fitnessLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelCard,
                  selectedLevel === level && styles.levelCardSelected,
                ]}
                onPress={() => setSelectedLevel(level)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.levelCardText,
                    selectedLevel === level && styles.levelCardTextSelected,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error && <Text style={commonStyles.errorText}>{error}</Text>}

          <Button
            title="Finish Onboarding"
            onPress={handleFinish}
            loading={loading}
            disabled={loading || !selectedLevel}
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
  levelsContainer: {
    marginBottom: theme.spacing.large * 2,
    width: '100%',
  },
  levelCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.large,
    paddingHorizontal: theme.spacing.medium,
    marginVertical: theme.spacing.small,
    borderWidth: 1,
    borderColor: theme.colors.grayLight,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 1,
  },
  levelCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 2,
  },
  levelCardText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.large,
    fontWeight: '500',
    textAlign: 'center',
  },
  levelCardTextSelected: {
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
});

export default OnboardingLevelScreen;
