import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { commonStyles } from '../styles/commonStyles';
import { theme } from '../styles/theme';

const HomeScreen: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome, {user?.name || user?.email}!</Text>
        <Text style={styles.subtitle}>Your fitness journey starts here.</Text>

        {user?.fitnessGoals && user.fitnessGoals.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Your Goals:</Text>
            {user.fitnessGoals.map((goal, index) => (
              <Text key={index} style={styles.cardText}>- {goal}</Text>
            ))}
          </View>
        )}

        {user?.fitnessLevel && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Your Fitness Level:</Text>
            <Text style={styles.cardText}>{user.fitnessLevel}</Text>
          </View>
        )}

        <Button
          title="Logout"
          onPress={logout}
          loading={isLoading}
          style={styles.logoutButton}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
  },
  title: {
    fontSize: theme.fontSizes.h1,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.large * 2,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.large,
    marginBottom: theme.spacing.large,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  cardText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xsmall,
  },
  logoutButton: {
    marginTop: theme.spacing.large * 2,
    width: '80%',
  },
});

export default HomeScreen;
