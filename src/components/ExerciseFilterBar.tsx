import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, Spacing, FontSizes, BorderRadius } from "../theme";
import { ExerciseCategory } from "../types";

const CATS: (ExerciseCategory | "All")[] = ["All", ExerciseCategory.Strength, ExerciseCategory.Cardio, ExerciseCategory.Flexibility, ExerciseCategory.Sports];
const CAT_COLOR: Record<string, string> = { All: Colors.primary, Strength: Colors.strength, Cardio: Colors.cardio, Flexibility: Colors.flexibility, Sports: Colors.sports };

export default function ExerciseFilterBar({ selectedCategory, onSelect }: { selectedCategory: ExerciseCategory | "All"; onSelect: (c: ExerciseCategory | "All") => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {CATS.map((c) => {
        const sel = c === selectedCategory;
        return (
          <TouchableOpacity key={c} style={[styles.pill, { backgroundColor: sel ? CAT_COLOR[c] : Colors.surfaceLight }]} onPress={() => onSelect(c)}>
            <Text style={[styles.text, { color: sel ? Colors.background : Colors.textSecondary, fontWeight: sel ? "700" : "500" }]}>{c}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  pill: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  text: { fontSize: FontSizes.md },
});
