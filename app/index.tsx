import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Counter } from "../types";
import { getAllCounters } from "../db/database";
import CounterCard from "../components/CounterCard";

const ONBOARDING_KEY = "onboarding_completed";

export default function HomeScreen() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const checkOnboarding = useCallback(async () => {
    try {
      const done = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!done) router.replace("/onboarding");
    } catch {
      // AsyncStorage 失敗時はそのまま続行
    }
  }, []);

  const loadCounters = useCallback(async () => {
    try {
      const data = await getAllCounters();
      setCounters(data);
    } catch {
      Alert.alert("エラー", "データの読み込みに失敗しました。アプリを再起動してください。");
    }
  }, []);

  useFocusEffect(useCallback(() => {
    checkOnboarding();
    loadCounters();
  }, [checkOnboarding, loadCounters]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCounters();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={counters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CounterCard counter={item} onPress={() => router.push(`/counter/${item.id}`)} />
        )}
        contentContainerStyle={counters.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C4956A" />
        }
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
      />
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={28} color="#FBF8F3" />
      </Pressable>

    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🌸</Text>
      <Text style={styles.emptyTitle}>大切な人との時間を{"\n"}可視化しましょう</Text>
      <Text style={styles.emptySubtitle}>「+」を押してカウンターを追加</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBF8F3" },
  list: { padding: 16, gap: 14, paddingBottom: 100 },
  emptyContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  empty: { alignItems: "center", gap: 12 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: {
    fontFamily: "ZenMaruGothic_700Bold",
    fontSize: 20, color: "#2C2C2C", textAlign: "center", lineHeight: 32,
  },
  emptySubtitle: {
    fontFamily: "ZenMaruGothic_400Regular",
    fontSize: 15, color: "#9B9B9B", textAlign: "center",
  },
  fab: {
    position: "absolute", bottom: 32, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#C4956A",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#C4956A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  fabPressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
});
