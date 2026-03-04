import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { getExerciseById } from "../../src/data/exercises";
import EmptyState from "../../src/components/EmptyState";
import { Colors, Spacing, FontSizes, BorderRadius } from "../../src/theme";
import { ExerciseCategory } from "../../src/types";

const CAT_COLOR: Record<ExerciseCategory, string> = {
  [ExerciseCategory.Strength]: Colors.strength, [ExerciseCategory.Cardio]: Colors.cardio,
  [ExerciseCategory.Flexibility]: Colors.flexibility, [ExerciseCategory.Sports]: Colors.sports,
};

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const exercise = getExerciseById(id);

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Exercise", headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.text, headerShown: true }} />
        <EmptyState emoji="❌" title="Exercise Not Found" message="This exercise doesn't exist." actionLabel="Go Back" onAction={() => router.back()} />
      </View>
    );
  }

  const badgeColor = CAT_COLOR[exercise.category];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: exercise.name, headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.text, headerShown: true }} />
      <View style={styles.emojiBox}><Text style={{ fontSize: 60 }}>{exercise.imageEmoji}</Text></View>
      <Text style={styles.name}>{exercise.name}</Text>
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}><Text style={styles.badgeText}>{exercise.category}</Text></View>
      </View>

      {exercise.muscleGroups.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscle Groups</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
            {exercise.muscleGroups.map((m) => (
              <View key={m} style={styles.pill}><Text style={styles.pillText}>{m}</Text></View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.desc}>{exercise.description}</Text>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{exercise.caloriesPerMinute}</Text>
          <Text style={styles.statLabel}>cal / min</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logBtn} onPress={() => router.push("/(tabs)/workouts" as any)} activeOpacity={0.8}>
        <Text style={styles.logBtnText}>Log This Exercise</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl, alignItems: "center" },
  emojiBox: { marginTop: Spacing.xl, marginBottom: Spacing.md },
  name: { fontSize: FontSizes.hero, fontWeight: "700", color: Colors.text, textAlign: "center", paddingHorizontal: Spacing.md },
  badgeRow: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.md },
  badge: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full },
  badgeText: { color: Colors.text, fontSize: FontSizes.sm, fontWeight: "700" },
  section: { width: "100%", paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: "700", color: Colors.text, marginBottom: Spacing.sm },
  pill: { backgroundColor: Colors.surfaceLight, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full },
  pillText: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: "600" },
  desc: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 22 },
  statRow: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.lg },
  statBox: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, alignItems: "center" },
  statVal: { fontSize: FontSizes.xxl, fontWeight: "700", color: Colors.accent },
  statLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  logBtn: { marginTop: Spacing.xl, backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: "center", width: "90%" },
  logBtnText: { color: Colors.text, fontSize: FontSizes.lg, fontWeight: "700" },
});
