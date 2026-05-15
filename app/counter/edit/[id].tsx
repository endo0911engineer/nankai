import { useEffect, useState } from "react";
import {
  Alert,
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
import { getCounter, updateCounter } from "../../../db/database";
import { Counter } from "../../../types";
import { FREQUENCY_PRESETS } from "../../../constants/presets";
import { currentAge } from "../../../utils/calculations";

export default function EditCounterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const counterId = parseInt(id, 10);

  const [counter, setCounter] = useState<Counter | null>(null);
  const [personName, setPersonName] = useState("");
  const [eventName, setEventName] = useState("");
  const [frequencyPerYear, setFrequencyPerYear] = useState<number>(12);
  const [personAge, setPersonAge] = useState("");
  const [personLifespan, setPersonLifespan] = useState("");

  useEffect(() => {
    getCounter(counterId).then((c) => {
      if (!c) return;
      setCounter(c);
      setPersonName(c.person_name);
      setEventName(c.event_name);
      setFrequencyPerYear(c.frequency_per_year);
      // birth_year → 現在の年齢に変換して表示
      setPersonAge(String(currentAge(c.birth_year)));
      setPersonLifespan(String(c.person_lifespan));
    });
  }, [counterId]);

  const handleSave = async () => {
    const age = parseInt(personAge, 10);
    const lifespan = parseInt(personLifespan, 10);
    if (!personName.trim() || !eventName.trim()) {
      Alert.alert("名前とイベントを入力してください");
      return;
    }
    if (isNaN(age) || isNaN(lifespan)) {
      Alert.alert("年齢を正しく入力してください");
      return;
    }
    // 年齢入力 → birth_year に変換して保存
    const birthYear = new Date().getFullYear() - age;
    await updateCounter(counterId, {
      person_name: personName.trim(),
      event_name: eventName.trim(),
      frequency_per_year: frequencyPerYear,
      birth_year: birthYear,
      person_lifespan: lifespan,
    });
    router.back();
  };

  if (!counter) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="相手の名前">
          <TextInput
            style={styles.input}
            value={personName}
            onChangeText={setPersonName}
            placeholder="例：母"
            placeholderTextColor="#C0B8B0"
          />
        </Field>

        <Field label="イベント">
          <TextInput
            style={styles.input}
            value={eventName}
            onChangeText={setEventName}
            placeholder="例：ご飯"
            placeholderTextColor="#C0B8B0"
          />
        </Field>

        <Field label="頻度">
          <View style={styles.chips}>
            {FREQUENCY_PRESETS.map((p) => (
              <Pressable
                key={p.value}
                style={[styles.chip, frequencyPerYear === p.value && styles.chipSelected]}
                onPress={() => setFrequencyPerYear(p.value)}
              >
                <Text style={[styles.chipText, frequencyPerYear === p.value && styles.chipTextSelected]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="相手の年齢">
          <TextInput
            style={styles.input}
            value={personAge}
            onChangeText={setPersonAge}
            keyboardType="number-pad"
            placeholder="例：68"
            placeholderTextColor="#C0B8B0"
          />
        </Field>

        <Field label="平均寿命">
          <TextInput
            style={styles.input}
            value={personLifespan}
            onChangeText={setPersonLifespan}
            keyboardType="number-pad"
            placeholder="例：85"
            placeholderTextColor="#C0B8B0"
          />
        </Field>

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>保存する</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
    backgroundColor: "#FBF8F3",
    flexGrow: 1,
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E8E2DA",
    backgroundColor: "#FFFFFF",
  },
  chipSelected: {
    backgroundColor: "#C4956A",
    borderColor: "#C4956A",
  },
  chipText: { fontSize: 14, color: "#5C5552", fontWeight: "500" },
  chipTextSelected: { color: "#FFFFFF" },
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
