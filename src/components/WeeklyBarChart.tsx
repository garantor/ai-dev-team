import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Colors, Spacing, FontSizes, BorderRadius } from "../theme";

interface Props { data: { day: string; count: number; calories: number }[]; }

export default function WeeklyBarChart({ data }: Props) {
  const w = Dimensions.get("window").width - Spacing.md * 2;
  if (!data.length) return <View style={styles.box}><Text style={styles.title}>This Week</Text><Text style={styles.empty}>No data</Text></View>;

  return (
    <View style={styles.box}>
      <Text style={styles.title}>This Week</Text>
      <BarChart
        data={{ labels: data.map((d) => d.day), datasets: [{ data: data.map((d) => d.count || 0) }] }}
        width={w - Spacing.md * 2} height={180} chartConfig={{
          backgroundGradientFrom: Colors.surface, backgroundGradientTo: Colors.surface,
          color: () => Colors.primary, labelColor: () => Colors.textSecondary,
          barPercentage: 0.6, decimalCount: 0,
          propsForBackgroundLines: { strokeDasharray: "4 4", stroke: Colors.surfaceLight },
        }}
        fromZero showBarTops={false} style={{ borderRadius: BorderRadius.md }}
        yAxisLabel="" yAxisSuffix=""
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceLight, marginBottom: Spacing.md },
  title: { color: Colors.text, fontSize: FontSizes.xl, fontWeight: "700", marginBottom: Spacing.md },
  empty: { color: Colors.textSecondary, textAlign: "center", paddingVertical: Spacing.xl },
});
