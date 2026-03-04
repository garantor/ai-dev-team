import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, Spacing, FontSizes, BorderRadius } from "../theme";
import { Workout, WorkoutType } from "../types";

const TYPE_META: Record<WorkoutType, { emoji: string; color: string }> = {
  [WorkoutType.Strength]: { emoji: "🏋️", color: Colors.strength },
  [WorkoutType.Cardio]: { emoji: "🏃", color: Colors.cardio },
  [WorkoutType.Flexibility]: { emoji: "🧘", color: Colors.flexibility },
  [WorkoutType.Sports]: { emoji: "⚽", color: Colors.sports },
};

function relativeTime(d: string): string {
  const ms = Date.now() - new Date(d).getTime();
  if (ms < 60000) return "just now";
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function WorkoutCard({ workout, onDelete }: { workout: Workout; onDelete?: (id: string) => void }) {
  const meta = TYPE_META[workout.type];
  return (
    <View style={styles.card}>
      <View style={[styles.indicator, { backgroundColor: meta.color }]} />
      <View style={styles.emojiBox}><Text style={{ fontSize: 28 }}>{meta.emoji}</Text></View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{workout.exerciseName}</Text>
          <View style={[styles.badge, { backgroundColor: meta.color + "22" }]}>
            <Text style={[styles.badgeText, { color: meta.color }]}>{workout.type}</Text>
          </View>
        </View>
        <Text style={styles.time}>{relativeTime(workout.date)}</Text>
      </View>
      <View style={styles.stats}>
        <Text style={styles.statVal}>{workout.duration}m ⏱️</Text>
        <Text style={styles.statVal}>{workout.caloriesBurned} 🔥</Text>
      </View>
      {onDelete && (
        <TouchableOpacity style={styles.del} onPress={() => onDelete(workout.id)}>
          <Text style={{ fontSize: 18 }}>🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, borderRadius: BorderRadius.md, marginVertical: Spacing.xs, overflow: "hidden" },
  indicator: { width: 4, alignSelf: "stretch" },
  emojiBox: { width: 48, alignItems: "center", justifyContent: "center", paddingLeft: Spacing.sm },
  info: { flex: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm },
  nameRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, flexWrap: "wrap" },
  name: { color: Colors.text, fontSize: FontSizes.lg, fontWeight: "600", flexShrink: 1 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: FontSizes.xs, fontWeight: "700", textTransform: "uppercase" },
  time: { color: Colors.textSecondary, fontSize: FontSizes.sm, marginTop: Spacing.xs },
  stats: { alignItems: "center", paddingRight: Spacing.md },
  statVal: { color: Colors.text, fontSize: FontSizes.sm, fontWeight: "700" },
  del: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.md },
});
