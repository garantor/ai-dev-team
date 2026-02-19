import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../components/Button';
import { commonStyles } from '../styles/commonStyles';
import { theme } from '../styles/theme';

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.content}>
        {/* Placeholder for a logo or welcome image */}
        <Image
          source={{ uri: 'https://via.placeholder.com/150/007AFF/FFFFFF?text=FitApp' }} // Replace with your app logo
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome to FitApp!</Text>
        <Text style={styles.subtitle}>Your personalized fitness journey starts here.</Text>

        <Button
          title="Login"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        />
        <Button
          title="Register"
          onPress={() => navigation.navigate('Register')}
          style={styles.button}
          variant="outline"
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
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: theme.spacing.large * 2,
  },
  title: {
    fontSize: theme.fontSizes.h1,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.large * 3,
    textAlign: 'center',
  },
  button: {
    width: '80%',
    marginBottom: theme.spacing.medium,
  },
});

export default WelcomeScreen;
