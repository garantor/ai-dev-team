import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Workout, WorkoutFormData } from '../types/workout';
import { globalStyles } from '../styles/globalStyles';

interface WorkoutFormProps {
  initialData?: Workout;
  onSubmit: (data: Omit<Workout, 'id' | 'date'>) => Promise<void>;
  isLoading: boolean;
  isEditMode?: boolean;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ initialData, onSubmit, isLoading, isEditMode = false }) => {
  const [formData, setFormData] = useState<WorkoutFormData>({
    type: initialData?.type || '',
    duration: initialData?.duration.toString() || '',
    caloriesBurned: initialData?.caloriesBurned.toString() || '',
    notes: initialData?.notes || '',
  });
  const [errors, setErrors] = useState<Partial<WorkoutFormData>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        duration: initialData.duration.toString(),
        caloriesBurned: initialData.caloriesBurned.toString(),
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof WorkoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<WorkoutFormData> = {};
    if (!formData.type.trim()) {
      newErrors.type = 'Workout type is required.';
    }
    const durationNum = parseInt(formData.duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      newErrors.duration = 'Duration must be a positive number.';
    }
    const caloriesNum = parseInt(formData.caloriesBurned);
    if (isNaN(caloriesNum) || caloriesNum < 0) {
      newErrors.caloriesBurned = 'Calories must be a non-negative number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const workoutData: Omit<Workout, 'id' | 'date'> = {
          type: formData.type.trim(),
          duration: parseInt(formData.duration),
          caloriesBurned: parseInt(formData.caloriesBurned),
          notes: formData.notes.trim() || undefined,
        };
        await onSubmit(workoutData);
      } catch (error) {
        console.error('Form submission error:', error);
        Alert.alert('Error', 'Failed to save workout. Please try again.');
      }
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={globalStyles.title}>{isEditMode ? 'Edit Workout' : 'Log New Workout'}</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Workout Type (e.g., Running, Weightlifting)"
        value={formData.type}
        onChangeText={(text) => handleChange('type', text)}
        autoCapitalize="words"
        testID="workout-type-input"
      />
      {errors.type && <Text style={globalStyles.errorText}>{errors.type}</Text>}

      <TextInput
        style={globalStyles.input}
        placeholder="Duration (minutes)"
        value={formData.duration}
        onChangeText={(text) => handleChange('duration', text)}
        keyboardType="numeric"
        testID="workout-duration-input"
      />
      {errors.duration && <Text style={globalStyles.errorText}>{errors.duration}</Text>}

      <TextInput
        style={globalStyles.input}
        placeholder="Calories Burned"
        value={formData.caloriesBurned}
        onChangeText={(text) => handleChange('caloriesBurned', text)}
        keyboardType="numeric"
        testID="workout-calories-input"
      />
      {errors.caloriesBurned && <Text style={globalStyles.errorText}>{errors.caloriesBurned}</Text>}

      <TextInput
        style={globalStyles.textArea}
        placeholder="Notes (optional)"
        value={formData.notes}
        onChangeText={(text) => handleChange('notes', text)}
        multiline
        numberOfLines={4}
        testID="workout-notes-input"
      />

      <TouchableOpacity
        style={[globalStyles.button, isLoading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isLoading}
        testID="workout-submit-button"
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={globalStyles.buttonText}>{isEditMode ? 'Save Changes' : 'Log Workout'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f2f5',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default WorkoutForm;
