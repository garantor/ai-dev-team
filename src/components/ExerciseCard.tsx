import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, Spacing, FontSizes, BorderRadius } from "../theme";
import { Exercise, ExerciseCategory } from "../types";

const CAT_COLOR: Record<ExerciseCategory, string> = {
  [ExerciseCategory.Strength]: Colors.strength, [ExerciseCategory.Cardio]: Colors.cardio,
  [ExerciseCategory.Flexibility]: Colors.flexibility, [ExerciseCategory.Sports]: Colors.sports,
};

export default function ExerciseCard({ exercise, onPress }: { exercise: Exercise; onPress?: (e: Exercise) => void }) {
  const c = CAT_COLOR[exercise.category];
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(exercise)} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <Text style={styles.emoji}>{exercise.imageEmoji}</Text>
      <Text style={styles.name} numberOfLines={1}>{exercise.name}</Text>
      <View style={[styles.badge, { backgroundColor: c + "22" }]}>
        <Text style={[styles.badgeText, { color: c }]}>{exercise.category}</Text>
      </View>
      <Text style={styles.cal}>🔥 {exercise.caloriesPerMinute} cal/min</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: "center", borderWidth: 1, borderColor: Colors.surfaceLight },
  emoji: { fontSize: 36, marginBottom: Spacing.sm },
  name: { color: Colors.text, fontSize: FontSizes.md, fontWeight: "700", textAlign: "center", marginBottom: Spacing.xs },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full, marginBottom: Spacing.xs },
  badgeText: { fontSize: FontSizes.xs, fontWeight: "700" },
  cal: { color: Colors.textSecondary, fontSize: FontSizes.xs },
});
