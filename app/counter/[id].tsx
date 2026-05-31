import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Counter, Memory } from "../../types";
import { getCounter, getMemories, deleteCounter, deleteMemory } from "../../db/database";
import { calcRemainingTimes, currentAge, formatDate } from "../../utils/calculations";
import { useCountUp } from "../../hooks/useCountUp";
import ShareCard from "../../components/ShareCard";

export default function CounterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const counterId = parseInt(id, 10);
  const navigation = useNavigation();

  const [counter, setCounter] = useState<Counter | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareVisible, setShareVisible] = useState(false);
  const shareCardRef = useRef<View>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [c, m] = await Promise.all([getCounter(counterId), getMemories(counterId)]);
      if (!c) { setError("カウンターが見つかりません。"); return; }
      setCounter(c);
      setMemories(m);
      navigation.setOptions({ title: `${c.person_name}との時間` });
    } catch {
      setError("データの読み込みに失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [counterId]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 4 }}>
          <Pressable style={styles.headerBtn} onPress={() => router.push(`/counter/edit/${id}`)}>
            <Ionicons name="pencil-outline" size={20} color="#C4956A" />
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#E07070" />
          </Pressable>
        </View>
      ),
    });
  }, [id]);

  const handleDelete = () => {
    Alert.alert("削除しますか？", "このカウンターと全ての思い出が削除されます。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCounter(counterId);
            router.back();
          } catch {
            Alert.alert("エラー", "削除に失敗しました。もう一度お試しください。");
          }
        },
      },
    ]);
  };

  const handleSaveToLibrary = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("アクセスが必要です", "設定から写真へのアクセスを許可してください。");
      return;
    }
    try {
      const uri = await captureRef(shareCardRef, { format: "png", quality: 1 });
      await MediaLibrary.saveToLibraryAsync(uri);
      setShareVisible(false);
      Alert.alert("保存しました", "カメラロールに保存されました。");
    } catch {
      Alert.alert("エラー", "保存に失敗しました。もう一度お試しください。");
    }
  };

  const handleShareDirect = async () => {
    try {
      const uri = await captureRef(shareCardRef, { format: "png", quality: 1 });
      setShareVisible(false);
      await Sharing.shareAsync(uri, { mimeType: "image/png" });
    } catch {
      Alert.alert("エラー", "シェアに失敗しました。もう一度お試しください。");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C4956A" />
      </View>
    );
  }

  if (error || !counter) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? "エラーが発生しました。"}</Text>
        <Pressable style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryBtnText}>もう一度試す</Text>
        </Pressable>
      </View>
    );
  }

  const remaining = calcRemainingTimes(counter);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HeroCard counter={counter} remaining={remaining} />

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.8 }]}
            onPress={() => setShareVisible(true)}
          >
            <Ionicons name="share-outline" size={18} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>シェアする</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.addMemoryBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.push({ pathname: "/memory/add", params: { counterId: id } })}
          >
            <Ionicons name="camera-outline" size={18} color="#C4956A" />
            <Text style={styles.addMemoryText}>思い出を記録</Text>
          </Pressable>
        </View>

        {memories.length > 0 ? (
          <View style={styles.memoriesSection}>
            <Text style={styles.sectionTitle}>思い出</Text>
            <View style={styles.memoriesList}>
              {memories.map((m) => (
                <MemoryItem
                  key={m.id}
                  memory={m}
                  onDelete={() => {
                    Alert.alert("削除しますか？", "この思い出を削除します。", [
                      { text: "キャンセル", style: "cancel" },
                      {
                        text: "削除", style: "destructive", onPress: async () => {
                          await deleteMemory(m.id);
                          setMemories((prev) => prev.filter((x) => x.id !== m.id));
                        }
                      },
                    ]);
                  }}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.noMemories}>
            <Text style={styles.noMemoriesText}>
              思い出をまだ記録していません。{"\n"}「思い出を記録」から追加しましょう。
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={shareVisible} animationType="slide" transparent onRequestClose={() => setShareVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>シェアする</Text>
            <View ref={shareCardRef} collapsable={false} style={styles.cardWrapper}>
              <ShareCard counter={counter} />
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalBtn, styles.modalBtnPrimary, pressed && { opacity: 0.8 }]}
                onPress={handleShareDirect}
              >
                <Ionicons name="share-outline" size={18} color="#FFFFFF" />
                <Text style={styles.modalBtnTextPrimary}>アプリでシェア</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalBtn, styles.modalBtnSecondary, pressed && { opacity: 0.8 }]}
                onPress={handleSaveToLibrary}
              >
                <Ionicons name="download-outline" size={18} color="#C4956A" />
                <Text style={styles.modalBtnTextSecondary}>カメラロールに保存</Text>
              </Pressable>
            </View>
            <Pressable style={styles.modalCancel} onPress={() => setShareVisible(false)}>
              <Text style={styles.modalCancelText}>キャンセル</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function HeroCard({ counter, remaining }: { counter: Counter; remaining: number }) {
  const animated = useCountUp(remaining);

  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroLabel}>{counter.person_name}と</Text>
      <View style={styles.heroCountRow}>
        <Text style={styles.heroPrefix}>あと</Text>
        <Text style={styles.heroCount}>{animated}</Text>
        <Text style={styles.heroSuffix}>回</Text>
      </View>
      <Text style={styles.heroEvent}>{counter.event_name}</Text>
      <View style={styles.heroMeta}>
        {counter.last_met_at && (
          <Text style={styles.metaText}>最後に会った日：{formatDate(counter.last_met_at)}</Text>
        )}
        {counter.mode === "period" && counter.end_date ? (
          <Text style={styles.metaText}>
            {formatDate(counter.end_date)}まで
          </Text>
        ) : (
          <Text style={styles.metaText}>
            現在{currentAge(counter.birth_year)}歳 / 平均寿命{counter.person_lifespan}歳
          </Text>
        )}
      </View>
    </View>
  );
}

function MemoryItem({ memory, onDelete }: { memory: Memory; onDelete: () => void }) {
  return (
    <View style={styles.memoryCard}>
      {memory.photo_uri && (
        <Image source={{ uri: memory.photo_uri }} style={styles.memoryPhoto} resizeMode="cover" />
      )}
      <View style={styles.memoryBody}>
        {memory.memo && <Text style={styles.memoryMemo}>{memory.memo}</Text>}
        <View style={styles.memoryFooter}>
          <Text style={styles.memoryDate}>{formatDate(memory.met_at)}</Text>
          <Pressable onPress={onDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color="#B0A89E" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBF8F3" },
  content: { padding: 20, gap: 14, paddingBottom: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16, padding: 32 },
  errorText: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 16, color: "#9B9B9B", textAlign: "center" },
  retryBtn: { backgroundColor: "#C4956A", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  retryBtnText: { fontFamily: "ZenMaruGothic_700Bold", fontSize: 15, color: "#FFFFFF" },
  headerBtn: { padding: 8 },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  heroLabel: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 20, color: "#7A6E68" },
  heroCountRow: { flexDirection: "row", alignItems: "flex-end", gap: 2, marginVertical: 4 },
  heroPrefix: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 22, color: "#2C2C2C", paddingBottom: 8 },
  heroCount: { fontFamily: "ZenMaruGothic_900Black", fontSize: 80, color: "#C4956A", lineHeight: 88 },
  heroSuffix: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 26, color: "#2C2C2C", paddingBottom: 10 },
  heroEvent: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 20, color: "#7A6E68" },
  heroMeta: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: "#F0EBE3",
    paddingTop: 16,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  metaText: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 13, color: "#B0A89E" },

  actions: { flexDirection: "row", gap: 10 },
  shareBtn: {
    flex: 1, backgroundColor: "#C4956A", borderRadius: 14, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  shareBtnText: { fontFamily: "ZenMaruGothic_700Bold", fontSize: 15, color: "#FFFFFF" },
  addMemoryBtn: {
    flex: 1, backgroundColor: "#FDF2E8", borderRadius: 14, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderWidth: 1.5, borderColor: "#F0D9BF",
  },
  addMemoryText: { fontFamily: "ZenMaruGothic_700Bold", fontSize: 15, color: "#C4956A" },

  memoriesSection: { gap: 12, marginTop: 8 },
  sectionTitle: { fontFamily: "ZenMaruGothic_700Bold", fontSize: 17, color: "#2C2C2C" },
  memoriesList: { gap: 12 },
  memoryCard: {
    backgroundColor: "#FFFFFF", borderRadius: 14, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  memoryPhoto: { width: "100%", height: 220 },
  memoryBody: { padding: 14, gap: 6 },
  memoryMemo: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 15, color: "#2C2C2C", lineHeight: 24 },
  memoryFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  memoryDate: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 13, color: "#B0A89E" },
  noMemories: { padding: 24, alignItems: "center" },
  noMemoriesText: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 14, color: "#B0A89E", textAlign: "center", lineHeight: 24 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: "#FBF8F3", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, alignItems: "center", gap: 20,
  },
  modalTitle: { fontFamily: "ZenMaruGothic_700Bold", fontSize: 17, color: "#2C2C2C" },
  cardWrapper: {
    borderRadius: 20, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4,
  },
  modalActions: { width: "100%", gap: 10 },
  modalBtn: {
    borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  modalBtnPrimary: { backgroundColor: "#C4956A" },
  modalBtnSecondary: { backgroundColor: "#FDF2E8", borderWidth: 1.5, borderColor: "#F0D9BF" },
  modalBtnTextPrimary: { fontFamily: "ZenMaruGothic_700Bold", fontSize: 16, color: "#FFFFFF" },
  modalBtnTextSecondary: { fontFamily: "ZenMaruGothic_700Bold", fontSize: 16, color: "#C4956A" },
  modalCancel: { paddingVertical: 8 },
  modalCancelText: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 15, color: "#9B9B9B" },
});
