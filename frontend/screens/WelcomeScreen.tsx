import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CustomButton from '@components/CustomButton';
import { globalStyles } from '@styles/globalStyles';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.formContainer}>
        <Text style={globalStyles.title}>Welcome to Fitness App!</Text>
        <Text style={styles.subtitle}>Your journey to a healthier you starts here.</Text>

        <CustomButton
          title="Login"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        />
        <CustomButton
          title="Register"
          onPress={() => navigation.navigate('Register')}
          variant="outline"
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    marginBottom: 10,
  },
});

export default WelcomeScreen;
