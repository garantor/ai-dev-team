import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return <Text style={globalStyles.errorText}>{message}</Text>;
};

export default ErrorMessage;
