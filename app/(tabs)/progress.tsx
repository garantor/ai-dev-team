import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkouts } from "../../src/contexts/WorkoutContext";
import { calculateStreak, getAverageDuration, getMonthlyData, getMostCommonWorkoutType, getTotalCalories, getWeeklyData } from "../../src/utils/calculations";
import ProgressChart from "../../src/components/ProgressChart";
import WeeklyBarChart from "../../src/components/WeeklyBarChart";
import StatCard from "../../src/components/StatCard";
import EmptyState from "../../src/components/EmptyState";
import { Colors, Spacing, FontSizes, BorderRadius } from "../../src/theme";

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { workouts } = useWorkouts();
  const [range, setRange] = useState<"7" | "30">("7");

  const chartData = useMemo(() => {
    const raw = range === "7" ? getWeeklyData(workouts) : getMonthlyData(workouts);
    return raw.map((d) => ({ label: d.day, value: d.calories }));
  }, [workouts, range]);

  const weeklyData = useMemo(() => getWeeklyData(workouts), [workouts]);

  if (workouts.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.header}>Progress</Text>
        <EmptyState emoji="📊" title="No Workouts Yet" message="Complete your first workout to start tracking progress." />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Progress</Text>
      <View style={styles.toggleRow}>
        {(["7", "30"] as const).map((r) => (
          <TouchableOpacity key={r} style={[styles.togglePill, range === r && styles.active]} onPress={() => setRange(r)}>
            <Text style={[styles.toggleText, range === r && styles.activeText]}>{r} Days</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ProgressChart data={chartData} color={Colors.accent} title="Calories Burned" suffix=" cal" />
      <View style={{ paddingHorizontal: Spacing.md }}><WeeklyBarChart data={weeklyData} /></View>
      <View style={styles.grid}>
        <View style={styles.gridItem}><StatCard label="Total Workouts" value={workouts.length} icon="🏋️" color={Colors.strength} /></View>
        <View style={styles.gridItem}><StatCard label="Avg Duration" value={`${getAverageDuration(workouts)} min`} icon="🕐" color={Colors.flexibility} /></View>
        <View style={styles.gridItem}><StatCard label="Total Calories" value={getTotalCalories(workouts)} icon="🔥" color={Colors.cardio} /></View>
        <View style={styles.gridItem}><StatCard label="Current Streak" value={`${calculateStreak(workouts)} days`} icon="⚡" color={Colors.sports} /></View>
        <View style={styles.gridItem}><StatCard label="Most Common" value={getMostCommonWorkoutType(workouts) ?? "—"} icon="⭐" color={Colors.primary} /></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  header: { fontSize: FontSizes.hero, fontWeight: "700", color: Colors.text, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  toggleRow: { flexDirection: "row", paddingHorizontal: Spacing.md, marginBottom: Spacing.lg, gap: Spacing.sm },
  togglePill: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceLight },
  active: { backgroundColor: Colors.primary },
  toggleText: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: "600" },
  activeText: { color: Colors.text },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: Spacing.md, marginTop: Spacing.lg, gap: Spacing.md },
  gridItem: { width: "47%" },
});
