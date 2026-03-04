import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, FontSizes, BorderRadius } from "../theme";

interface Props {
  totalCalories: number;
  workoutCount: number;
  totalDuration: number;
}

const StatItem: React.FC<{ emoji: string; value: number; label: string }> = ({ emoji, value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value.toLocaleString()}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function DashboardSummaryCard({ totalCalories, workoutCount, totalDuration }: Props) {
  return (
    <View style={styles.outer}>
      <View style={styles.gradientBase} />
      <View style={styles.gradientOverlay} />
      <View style={styles.content}>
        <Text style={styles.title}>Today's Summary</Text>
        <View style={styles.statsRow}>
          <StatItem emoji="🔥" value={totalCalories} label="Calories" />
          <View style={styles.divider} />
          <StatItem emoji="🏋️" value={workoutCount} label="Workouts" />
          <View style={styles.divider} />
          <StatItem emoji="⏱️" value={totalDuration} label="Minutes" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: BorderRadius.lg, overflow: "hidden", marginVertical: Spacing.sm, minHeight: 160 },
  gradientBase: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.primary },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.primaryDark, opacity: 0.7, transform: [{ skewY: "-6deg" }, { scaleY: 1.5 }], top: "30%" },
  content: { padding: Spacing.lg, zIndex: 1 },
  title: { color: Colors.text, fontSize: FontSizes.xl, fontWeight: "700", marginBottom: Spacing.lg, textAlign: "center" },
  statsRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  statItem: { alignItems: "center", flex: 1 },
  statEmoji: { fontSize: 28, marginBottom: Spacing.xs },
  statValue: { color: Colors.text, fontSize: FontSizes.hero, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.8)", fontSize: FontSizes.sm, fontWeight: "500", marginTop: Spacing.xs, textTransform: "uppercase", letterSpacing: 1 },
  divider: { width: 1, height: 48, backgroundColor: "rgba(255,255,255,0.2)" },
});
