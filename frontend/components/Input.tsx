import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import { theme } from '../styles/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, style, ...rest }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={theme.colors.grayDark}
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.medium,
    width: '100%',
  },
  label: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xsmall,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderColor: theme.colors.grayLight,
    borderWidth: 1,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: theme.spacing.medium,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.white,
  },
  inputError: {
    borderColor: theme.colors.danger,
    borderWidth: 2,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    marginTop: theme.spacing.xsmall,
  },
});

export default Input;
