import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, FlatList } from "react-native";
import { Colors, Spacing, FontSizes, BorderRadius } from "../theme";
import { WorkoutType, ExerciseCategory, Exercise, Workout } from "../types";
import { exercises } from "../data/exercises";

const TYPE_COLOR: Record<WorkoutType, string> = {
  [WorkoutType.Strength]: Colors.strength, [WorkoutType.Cardio]: Colors.cardio,
  [WorkoutType.Flexibility]: Colors.flexibility, [WorkoutType.Sports]: Colors.sports,
};

export default function WorkoutForm({ onSubmit, initialExerciseId }: { onSubmit: (w: Omit<Workout, "id">) => void; initialExerciseId?: string }) {
  const init = initialExerciseId ? exercises.find((e) => e.id === initialExerciseId) : undefined;
  const [type, setType] = useState<WorkoutType>(init ? (init.category as unknown as WorkoutType) : WorkoutType.Strength);
  const [exercise, setExercise] = useState<Exercise | null>(init ?? null);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);

  const filtered = useMemo(() => exercises.filter(
    (e) => e.category === type && (!search || e.name.toLowerCase().includes(search.toLowerCase()))
  ), [type, search]);

  useEffect(() => { if (!initialExerciseId) { setExercise(null); setSearch(""); } }, [type]);

  const calories = useMemo(() => exercise && duration ? Math.round(exercise.caloriesPerMinute * parseFloat(duration || "0")) : 0, [exercise, duration]);
  const isValid = exercise !== null && parseFloat(duration) > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Workout Type</Text>
      <View style={styles.typeRow}>
        {Object.values(WorkoutType).map((t) => (
          <TouchableOpacity key={t} style={[styles.pill, { backgroundColor: t === type ? TYPE_COLOR[t] : Colors.surfaceLight }]} onPress={() => setType(t)}>
            <Text style={[styles.pillText, { color: t === type ? Colors.background : Colors.textSecondary }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Exercise</Text>
      <TouchableOpacity style={styles.picker} onPress={() => setShowList(!showList)}>
        <Text style={[styles.pickerText, !exercise && { color: Colors.textSecondary }]}>
          {exercise ? `${exercise.imageEmoji}  ${exercise.name}` : "Select an exercise..."}
        </Text>
      </TouchableOpacity>

      {showList && (
        <View style={styles.listBox}>
          <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor={Colors.textSecondary} value={search} onChangeText={setSearch} />
          <FlatList data={filtered} keyExtractor={(i) => i.id} style={{ maxHeight: 180 }} nestedScrollEnabled renderItem={({ item }) => (
            <TouchableOpacity style={[styles.listItem, exercise?.id === item.id && { backgroundColor: TYPE_COLOR[type] + "22" }]} onPress={() => { setExercise(item); setShowList(false); }}>
              <Text style={{ fontSize: 24, marginRight: Spacing.sm }}>{item.imageEmoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.text, fontWeight: "600" }}>{item.name}</Text>
                <Text style={{ color: Colors.textSecondary, fontSize: FontSizes.xs }}>{item.caloriesPerMinute} cal/min</Text>
              </View>
            </TouchableOpacity>
          )} />
        </View>
      )}

      <Text style={styles.label}>Duration (minutes)</Text>
      <TextInput style={styles.input} placeholder="0" placeholderTextColor={Colors.textSecondary} keyboardType="numeric" value={duration} onChangeText={(v) => setDuration(v.replace(/[^0-9]/g, ""))} />

      <View style={styles.calBox}>
        <Text style={{ color: Colors.textSecondary }}>Estimated Calories</Text>
        <Text style={{ color: Colors.primary, fontSize: FontSizes.xl, fontWeight: "700" }}>{calories} kcal</Text>
      </View>

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput style={[styles.input, { minHeight: 80 }]} placeholder="How did it go?" placeholderTextColor={Colors.textSecondary} value={notes} onChangeText={setNotes} multiline textAlignVertical="top" />

      <TouchableOpacity style={[styles.submit, !isValid && { opacity: 0.4 }]} disabled={!isValid} onPress={() => {
        onSubmit({ exerciseId: exercise!.id, exerciseName: exercise!.name, type, duration: parseFloat(duration), caloriesBurned: calories, date: new Date().toISOString(), notes: notes.trim() || undefined });
        setExercise(null); setDuration(""); setNotes("");
      }}>
        <Text style={{ color: Colors.text, fontSize: FontSizes.lg, fontWeight: "700" }}>Log Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md },
  label: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: Spacing.xs, marginTop: Spacing.lg },
  typeRow: { flexDirection: "row", gap: Spacing.sm },
  pill: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, alignItems: "center" },
  pillText: { fontSize: FontSizes.xs, fontWeight: "700" },
  picker: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceLight },
  pickerText: { color: Colors.text, fontSize: FontSizes.lg },
  listBox: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, marginTop: Spacing.xs, borderWidth: 1, borderColor: Colors.surfaceLight, maxHeight: 250, overflow: "hidden" },
  searchInput: { backgroundColor: Colors.surfaceLight, color: Colors.text, fontSize: FontSizes.md, padding: Spacing.sm, margin: Spacing.sm, borderRadius: BorderRadius.sm },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceLight },
  input: { backgroundColor: Colors.surface, color: Colors.text, fontSize: FontSizes.lg, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.surfaceLight },
  calBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginTop: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + "44" },
  submit: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, alignItems: "center", marginTop: Spacing.xl },
});
