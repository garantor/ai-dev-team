import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, Spacing, FontSizes, BorderRadius } from "../theme";

export default function EmptyState({ emoji = "📭", title, message, actionLabel, onAction }: { emoji?: string; title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.btn} onPress={onAction}><Text style={styles.btnText}>{actionLabel}</Text></TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xxl },
  emoji: { fontSize: 64, marginBottom: Spacing.lg },
  title: { color: Colors.text, fontSize: FontSizes.xxl, fontWeight: "700", textAlign: "center", marginBottom: Spacing.sm },
  message: { color: Colors.textSecondary, fontSize: FontSizes.md, textAlign: "center", lineHeight: 22, maxWidth: 280 },
  btn: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.full, marginTop: Spacing.lg },
  btnText: { color: Colors.text, fontSize: FontSizes.md, fontWeight: "600" },
});
