import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Colors, Spacing, FontSizes, BorderRadius } from "../theme";

interface Props { data: { label: string; value: number }[]; color?: string; title?: string; suffix?: string; }

export default function ProgressChart({ data, color = Colors.primary, title, suffix = "" }: Props) {
  const w = Dimensions.get("window").width - Spacing.md * 2;
  if (!data.length) return <View style={styles.box}>{title && <Text style={styles.title}>{title}</Text>}<Text style={styles.empty}>No data available</Text></View>;

  return (
    <View style={styles.box}>
      {title && <Text style={styles.title}>{title}</Text>}
      <LineChart
        data={{ labels: data.filter((_, i) => i % Math.ceil(data.length / 7) === 0).map((d) => d.label), datasets: [{ data: data.map((d) => d.value || 0) }] }}
        width={w - Spacing.md * 2} height={200} chartConfig={{
          backgroundGradientFrom: Colors.surface, backgroundGradientTo: Colors.surface,
          color: () => color, labelColor: () => Colors.textSecondary, decimalCount: 0,
          propsForBackgroundLines: { strokeDasharray: "4 4", stroke: Colors.surfaceLight },
          propsForDots: { r: "3", stroke: color, fill: Colors.surface },
        }}
        bezier fromZero withInnerLines withOuterLines={false} style={{ borderRadius: BorderRadius.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceLight, marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  title: { color: Colors.text, fontSize: FontSizes.xl, fontWeight: "700", marginBottom: Spacing.md },
  empty: { color: Colors.textSecondary, textAlign: "center", paddingVertical: Spacing.xl },
});
