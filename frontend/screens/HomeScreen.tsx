import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CustomButton from '@components/CustomButton';
import { globalStyles } from '@styles/globalStyles';
import { useAuth } from '@hooks/useAuth';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login'); // Navigate back to login after logout
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show an alert
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.formContainer}>
        <Text style={globalStyles.title}>Welcome, {user?.name || 'User'}!</Text>
        <Text style={styles.infoText}>Email: {user?.email}</Text>
        <Text style={styles.infoText}>University: {user?.university}</Text>
        {user?.fitnessGoals && user.fitnessGoals.length > 0 && (
          <Text style={styles.infoText}>Goals: {user.fitnessGoals.join(', ')}</Text>
        )}
        {user?.fitnessLevel && (
          <Text style={styles.infoText}>Level: {user.fitnessLevel.charAt(0).toUpperCase() + user.fitnessLevel.slice(1)}</Text>
        )}

        <CustomButton
          title="Logout"
          onPress={handleLogout}
          loading={isLoading}
          disabled={isLoading}
          variant="secondary"
          style={styles.logoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 30,
  },
});

export default HomeScreen;
