import React from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, Platform } from "react-native";
import { Colors, Spacing, FontSizes, BorderRadius } from "../theme";
import ActivityRing from "./ActivityRing";

interface Props { steps: number; goal: number; onAddSteps: (steps: number) => void; }

export default function StepCounter({ steps, goal, onAddSteps }: Props) {
  const progress = goal > 0 ? steps / goal : 0;

  const handleAdd = () => {
    if (Platform.OS === "ios") {
      Alert.prompt("Add Steps", "Enter steps to add:", [
        { text: "Cancel", style: "cancel" },
        { text: "Add", onPress: (v) => { const n = parseInt(v ?? "", 10); if (n > 0) onAddSteps(n); } },
      ], "plain-text", "", "number-pad");
    } else {
      Alert.alert("Add Steps", "Select steps to add:", [
        ...[500, 1000, 2000, 5000].map((v) => ({ text: `+${v}`, onPress: () => onAddSteps(v) })),
        { text: "Cancel", style: "cancel" as const },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityRing progress={progress} size={180} strokeWidth={14} />
      <Text style={styles.stepsText}>
        <Text style={styles.current}>{steps.toLocaleString()}</Text>
        {" / "}
        <Text style={styles.goal}>{goal.toLocaleString()} steps</Text>
      </Text>
      <TouchableOpacity style={styles.btn} onPress={handleAdd} activeOpacity={0.75}>
        <Text style={styles.btnIcon}>👟</Text>
        <Text style={styles.btnText}>Add Steps</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: Spacing.lg },
  stepsText: { marginTop: Spacing.md, fontSize: FontSizes.lg, color: Colors.textSecondary },
  current: { color: Colors.text, fontWeight: "700", fontSize: FontSizes.xl },
  goal: { color: Colors.textSecondary },
  btn: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.full, marginTop: Spacing.lg, gap: Spacing.sm },
  btnIcon: { fontSize: 18 },
  btnText: { color: Colors.text, fontSize: FontSizes.md, fontWeight: "600" },
});
