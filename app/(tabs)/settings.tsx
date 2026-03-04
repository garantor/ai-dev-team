import React, { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../../src/contexts/SettingsContext";
import { clearAllData } from "../../src/utils/storage";
import { Colors, Spacing, FontSizes, BorderRadius } from "../../src/theme";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const [name, setName] = useState(settings.userName);
  const [stepGoal, setStepGoal] = useState(String(settings.dailyStepGoal));
  const [calGoal, setCalGoal] = useState(String(settings.dailyCalorieGoal));
  const [workoutGoal, setWorkoutGoal] = useState(String(settings.weeklyWorkoutGoal));

  const handleClear = useCallback(() => {
    Alert.alert("Clear All Data", "Delete all data? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await clearAllData(); Alert.alert("Success", "All data cleared."); } },
    ]);
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={{ paddingTop: insets.top }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Settings</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} onBlur={() => updateSettings({ userName: name.trim() })} placeholder="Your name" placeholderTextColor={Colors.textSecondary} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Daily Step Goal</Text>
          <TextInput style={styles.input} value={stepGoal} onChangeText={setStepGoal} onBlur={() => { const v = parseInt(stepGoal); if (v > 0) updateSettings({ dailyStepGoal: v }); }} keyboardType="numeric" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Daily Calorie Goal</Text>
          <TextInput style={styles.input} value={calGoal} onChangeText={setCalGoal} onBlur={() => { const v = parseInt(calGoal); if (v > 0) updateSettings({ dailyCalorieGoal: v }); }} keyboardType="numeric" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Weekly Workout Goal</Text>
          <TextInput style={styles.input} value={workoutGoal} onChangeText={setWorkoutGoal} onBlur={() => { const v = parseInt(workoutGoal); if (v > 0) updateSettings({ weeklyWorkoutGoal: v }); }} keyboardType="numeric" />
        </View>

        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearText}>Clear All Data</Text>
        </TouchableOpacity>
        <Text style={styles.version}>FitTrack v1.0.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  header: { fontSize: FontSizes.hero, fontWeight: "700", color: Colors.text, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  field: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  label: { fontSize: FontSizes.md, fontWeight: "600", color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surface, color: Colors.text, fontSize: FontSizes.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  clearBtn: { marginHorizontal: Spacing.md, marginTop: Spacing.xl, backgroundColor: Colors.error, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: "center" },
  clearText: { color: Colors.text, fontSize: FontSizes.lg, fontWeight: "700" },
  version: { textAlign: "center", color: Colors.textSecondary, fontSize: FontSizes.sm, marginTop: Spacing.xl },
});
