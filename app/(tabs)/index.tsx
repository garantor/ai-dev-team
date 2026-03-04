import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkouts } from "../../src/contexts/WorkoutContext";
import { useSettings } from "../../src/contexts/SettingsContext";
import DashboardSummaryCard from "../../src/components/DashboardSummaryCard";
import StepCounter from "../../src/components/StepCounter";
import WorkoutCard from "../../src/components/WorkoutCard";
import EmptyState from "../../src/components/EmptyState";
import { isToday } from "../../src/utils/dateHelpers";
import { calculateStreak } from "../../src/utils/calculations";
import { Colors, Spacing, FontSizes, BorderRadius } from "../../src/theme";

function getGreeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { workouts, todaySteps, loading, deleteWorkout, updateSteps, getTodaySummary } = useWorkouts();
  const { settings } = useSettings();
  const [refreshing, setRefreshing] = useState(false);

  const summary = getTodaySummary();
  const todayWorkouts = workouts.filter((w) => isToday(w.date));
  const streak = calculateStreak(workouts);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  }, []);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, {settings.userName || "Athlete"}</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</Text>
      </View>

      <DashboardSummaryCard totalCalories={summary.totalCalories} workoutCount={summary.workoutCount} totalDuration={summary.totalDuration} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Steps</Text>
        <StepCounter steps={todaySteps} goal={settings.dailyStepGoal} onAddSteps={updateSteps} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Workouts</Text>
        {todayWorkouts.length > 0 ? todayWorkouts.map((w) => <WorkoutCard key={w.id} workout={w} onDelete={deleteWorkout} />) : (
          <EmptyState emoji="🏋️" title="No workouts yet" message="Start your first workout of the day!" />
        )}
      </View>

      <View style={styles.streak}>
        <Text style={{ fontSize: 40 }}>🔥</Text>
        <Text style={styles.streakVal}>{streak}</Text>
        <Text style={styles.streakLabel}>Day Streak</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  greeting: { fontSize: FontSizes.hero, fontWeight: "700", color: Colors.text },
  date: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  section: { marginTop: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: "600", color: Colors.text, marginBottom: Spacing.sm },
  streak: { alignItems: "center", backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginTop: Spacing.lg },
  streakVal: { fontSize: FontSizes.hero, fontWeight: "700", color: Colors.accent, marginTop: Spacing.xs },
  streakLabel: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs },
});
