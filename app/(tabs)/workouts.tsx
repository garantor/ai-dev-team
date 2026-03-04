import React, { useCallback, useState } from "react";
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useWorkouts } from "../../src/contexts/WorkoutContext";
import WorkoutForm from "../../src/components/WorkoutForm";
import WorkoutCard from "../../src/components/WorkoutCard";
import EmptyState from "../../src/components/EmptyState";
import { groupByDate } from "../../src/utils/dateHelpers";
import { calculateStreak } from "../../src/utils/calculations";
import { Colors, Spacing, FontSizes, BorderRadius } from "../../src/theme";

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const { workouts, addWorkout, deleteWorkout } = useWorkouts();
  const [showForm, setShowForm] = useState(false);

  const streak = calculateStreak(workouts);
  const sections = groupByDate(workouts);

  const handleSubmit = useCallback((w: Parameters<typeof addWorkout>[0]) => {
    addWorkout(w);
    setShowForm(false);
  }, [addWorkout]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <View style={styles.streakBadge}><Text style={styles.streakText}>🔥 {streak}</Text></View>
      </View>

      <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowForm(!showForm)} activeOpacity={0.8}>
        <Ionicons name={showForm ? "close-circle" : "add-circle"} size={22} color={Colors.text} />
        <Text style={styles.toggleText}>{showForm ? "Cancel" : "Log Workout"}</Text>
      </TouchableOpacity>

      {showForm && <WorkoutForm onSubmit={handleSubmit} />}

      {sections.length > 0 ? (
        <SectionList sections={sections} keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
          renderItem={({ item }) => <WorkoutCard workout={item} onDelete={deleteWorkout} />}
          contentContainerStyle={styles.listContent} stickySectionHeadersEnabled={false} />
      ) : !showForm && (
        <EmptyState emoji="📝" title="No workouts logged" message="Tap 'Log Workout' to record your first session." actionLabel="Log Workout" onAction={() => setShowForm(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: FontSizes.hero, fontWeight: "700", color: Colors.text },
  streakBadge: { backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  streakText: { fontSize: FontSizes.md, fontWeight: "600", color: Colors.accent },
  toggleBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginHorizontal: Spacing.md, marginTop: Spacing.sm, gap: Spacing.sm },
  toggleText: { fontSize: FontSizes.lg, fontWeight: "600", color: Colors.text },
  sectionHeader: { fontSize: FontSizes.lg, fontWeight: "600", color: Colors.textSecondary, paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.xs },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
});
