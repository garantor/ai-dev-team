import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, FontSizes, BorderRadius } from "../theme";

export default function StatCard({ label, value, icon, color = Colors.primary }: { label: string; value: string | number; icon: string; color?: string }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBg, { backgroundColor: color + "1A" }]}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{typeof value === "number" ? value.toLocaleString() : value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, alignItems: "center" },
  iconBg: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: "center", justifyContent: "center", marginBottom: Spacing.sm },
  value: { fontSize: FontSizes.xxl, fontWeight: "800" },
  label: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: "500", marginTop: Spacing.xs, textAlign: "center" },
});
