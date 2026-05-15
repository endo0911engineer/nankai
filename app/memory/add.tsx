import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { createMemory, updateCounter } from "../../db/database";
import { todayISO } from "../../utils/calculations";

export default function AddMemoryScreen() {
  const { counterId } = useLocalSearchParams<{ counterId: string }>();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [metAt, setMetAt] = useState(todayISO());

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("写真へのアクセスが必要です", "設定からアクセスを許可してください。");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("カメラへのアクセスが必要です", "設定からアクセスを許可してください。");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!photoUri && !memo.trim()) {
      Alert.alert("写真かメモのどちらかを入力してください");
      return;
    }
    const id = parseInt(counterId, 10);
    await createMemory({
      counter_id: id,
      photo_uri: photoUri,
      memo: memo.trim() || null,
      met_at: metAt,
    });
    await updateCounter(id, { last_met_at: metAt });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Photo section */}
        {photoUri ? (
          <Pressable onPress={pickImage}>
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
            <View style={styles.changePhotoOverlay}>
              <Text style={styles.changePhotoText}>写真を変更</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Pressable style={styles.photoBtn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color="#C4956A" />
              <Text style={styles.photoBtnText}>カメラ</Text>
            </Pressable>
            <View style={styles.photoDivider} />
            <Pressable style={styles.photoBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color="#C4956A" />
              <Text style={styles.photoBtnText}>ライブラリ</Text>
            </Pressable>
          </View>
        )}

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>日付</Text>
          <TextInput
            style={styles.input}
            value={metAt}
            onChangeText={setMetAt}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#C0B8B0"
          />
        </View>

        {/* Memo */}
        <View style={styles.field}>
          <Text style={styles.label}>一言メモ</Text>
          <TextInput
            style={[styles.input, styles.memoInput]}
            value={memo}
            onChangeText={setMemo}
            placeholder="今日の思い出を一言で..."
            placeholderTextColor="#C0B8B0"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>思い出を保存する</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    backgroundColor: "#FBF8F3",
    flexGrow: 1,
  },
  photo: {
    width: "100%",
    height: 240,
    borderRadius: 16,
  },
  changePhotoOverlay: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changePhotoText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  photoPlaceholder: {
    height: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E8E2DA",
    borderStyle: "dashed",
    flexDirection: "row",
    overflow: "hidden",
  },
  photoBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoBtnText: {
    fontSize: 14,
    color: "#C4956A",
    fontWeight: "500",
  },
  photoDivider: {
    width: 1,
    backgroundColor: "#E8E2DA",
    marginVertical: 24,
  },
  field: { gap: 8 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9B9B9B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2C2C2C",
    borderWidth: 1.5,
    borderColor: "#E8E2DA",
  },
  memoInput: {
    height: 120,
    paddingTop: 14,
  },
  saveBtn: {
    backgroundColor: "#C4956A",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
