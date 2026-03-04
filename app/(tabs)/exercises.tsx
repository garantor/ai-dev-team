import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ExerciseCard from "../../src/components/ExerciseCard";
import ExerciseFilterBar from "../../src/components/ExerciseFilterBar";
import { exercises } from "../../src/data/exercises";
import { ExerciseCategory } from "../../src/types";
import { Colors, Spacing, FontSizes, BorderRadius } from "../../src/theme";

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ExerciseCategory | "All">("All");

  const filtered = useMemo(() => {
    let r = exercises;
    if (search.trim()) r = r.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
    if (category !== "All") r = r.filter((e) => e.category === category);
    return r;
  }, [search, category]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Exercise Library</Text>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} style={{ marginRight: Spacing.sm }} />
        <TextInput style={styles.searchInput} placeholder="Search exercises..." placeholderTextColor={Colors.textSecondary} value={search} onChangeText={setSearch} />
        {search.length > 0 && <Ionicons name="close-circle" size={18} color={Colors.textSecondary} onPress={() => setSearch("")} />}
      </View>
      <ExerciseFilterBar selectedCategory={category} onSelect={setCategory} />
      <FlatList data={filtered} keyExtractor={(i) => i.id} numColumns={2} columnWrapperStyle={styles.row}
        renderItem={({ item }) => <ExerciseCard exercise={item} onPress={() => router.push(`/exercise/${item.id}` as any)} />}
        contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.empty}><Text style={{ fontSize: 48 }}>🔍</Text><Text style={styles.emptyTitle}>No exercises found</Text></View>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSizes.hero, fontWeight: "700", color: Colors.text, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, borderRadius: BorderRadius.md, marginHorizontal: Spacing.md, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSizes.lg, color: Colors.text, paddingVertical: Spacing.md },
  row: { justifyContent: "space-between", paddingHorizontal: Spacing.md, gap: Spacing.md, marginBottom: Spacing.md },
  list: { paddingTop: Spacing.sm, paddingBottom: Spacing.xxl },
  empty: { alignItems: "center", marginTop: Spacing.xxl * 2 },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: "600", color: Colors.text, marginTop: Spacing.md },
});
