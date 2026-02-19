import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { globalStyles } from '@styles/globalStyles';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = 'Loading...' }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <View style={globalStyles.loadingOverlay}>
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#007bff" />
        {message && <Text style={styles.loadingText}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default LoadingOverlay;
