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
import { DEFAULT_LIFESPAN, FREQUENCY_PRESETS } from "../../../constants/presets";
import { currentAge } from "../../../utils/calculations";

export default function EditCounterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const counterId = parseInt(id, 10);

  const [counter, setCounter] = useState<Counter | null>(null);
  const [personName, setPersonName] = useState("");
  const [eventName, setEventName] = useState("");
  const [frequencyPerYear, setFrequencyPerYear] = useState<number>(12);
  const [customFreq, setCustomFreq] = useState("");
  const [mode, setMode] = useState<"lifespan" | "period">("lifespan");
  const [personAge, setPersonAge] = useState("");
  const [personLifespan, setPersonLifespan] = useState(String(DEFAULT_LIFESPAN));
  const [periodValue, setPeriodValue] = useState("");
  const [periodUnit, setPeriodUnit] = useState<"年" | "日">("年");

  useEffect(() => {
    getCounter(counterId).then((c) => {
      if (!c) return;
      setCounter(c);
      setPersonName(c.person_name);
      setEventName(c.event_name);
      setFrequencyPerYear(c.frequency_per_year);
      const isPreset = FREQUENCY_PRESETS.some((p) => p.value === c.frequency_per_year);
      if (!isPreset) setCustomFreq(String(c.frequency_per_year));

      setMode(c.mode ?? "lifespan");
      if (c.mode === "period" && c.end_date) {
        const now = new Date();
        const end = new Date(c.end_date);
        const diffDays = Math.max(0, (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 365) {
          setPeriodUnit("年");
          setPeriodValue(String(Math.round((diffDays / 365.25) * 10) / 10));
        } else {
          setPeriodUnit("日");
          setPeriodValue(String(Math.ceil(diffDays)));
        }
      } else {
        setPersonAge(String(currentAge(c.birth_year)));
        setPersonLifespan(String(c.person_lifespan));
      }
    });
  }, [counterId]);

  const effectiveFreq = customFreq ? parseFloat(customFreq) : frequencyPerYear;

  const handleSave = async () => {
    if (!personName.trim() || !eventName.trim()) {
      Alert.alert("名前とイベントを入力してください");
      return;
    }
    if (isNaN(effectiveFreq) || effectiveFreq <= 0) {
      Alert.alert("頻度を正しく入力してください");
      return;
    }

    let birthYear = 0;
    let lifespan = 0;
    let endDate: string | null = null;

    if (mode === "period") {
      const val = parseFloat(periodValue);
      if (isNaN(val) || val <= 0) {
        Alert.alert("期間を正しく入力してください");
        return;
      }
      const now = new Date();
      if (periodUnit === "日") {
        now.setDate(now.getDate() + Math.ceil(val));
      } else {
        now.setFullYear(now.getFullYear() + Math.floor(val));
        now.setMonth(now.getMonth() + Math.round((val % 1) * 12));
      }
      endDate = now.toISOString().split("T")[0];
    } else {
      const age = parseInt(personAge, 10);
      lifespan = parseInt(personLifespan, 10) || DEFAULT_LIFESPAN;
      if (isNaN(age) || age < 0 || age > 130) {
        Alert.alert("年齢を正しく入力してください");
        return;
      }
      birthYear = new Date().getFullYear() - age;
    }

    await updateCounter(counterId, {
      person_name: personName.trim(),
      event_name: eventName.trim(),
      frequency_per_year: effectiveFreq,
      birth_year: birthYear,
      person_lifespan: lifespan,
      mode,
      end_date: endDate,
    });
    router.back();
  };

  if (!counter) return null;

  const isPresetSelected = FREQUENCY_PRESETS.some((p) => p.value === frequencyPerYear) && !customFreq;

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
                style={[styles.chip, frequencyPerYear === p.value && !customFreq && styles.chipSelected]}
                onPress={() => { setFrequencyPerYear(p.value); setCustomFreq(""); }}
              >
                <Text style={[styles.chipText, frequencyPerYear === p.value && !customFreq && styles.chipTextSelected]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.customFreqRow}>
            <TextInput
              style={[styles.input, styles.customFreqInput, customFreq ? styles.customFreqActive : null]}
              value={customFreq}
              onChangeText={(t) => { setCustomFreq(t); }}
              placeholder="自由入力（年間回数）"
              placeholderTextColor="#C0B8B0"
              keyboardType="decimal-pad"
            />
            <Text style={styles.freqUnit}>回/年</Text>
          </View>
        </Field>

        <Field label="関係性">
          <View style={styles.modeToggle}>
            <Pressable
              style={[styles.modeBtn, mode === "lifespan" && styles.modeBtnActive]}
              onPress={() => setMode("lifespan")}
            >
              <Text style={[styles.modeBtnText, mode === "lifespan" && styles.modeBtnTextActive]}>寿命で計算</Text>
              <Text style={[styles.modeSubText, mode === "lifespan" && styles.modeSubTextActive]}>年齢・平均寿命から</Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, mode === "period" && styles.modeBtnActive]}
              onPress={() => setMode("period")}
            >
              <Text style={[styles.modeBtnText, mode === "period" && styles.modeBtnTextActive]}>期間で計算</Text>
              <Text style={[styles.modeSubText, mode === "period" && styles.modeSubTextActive]}>転勤・卒業など</Text>
            </Pressable>
          </View>
        </Field>

        {mode === "lifespan" ? (
          <>
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
          </>
        ) : (
          <Field label="残り期間">
            <View style={styles.periodRow}>
              <Text style={styles.periodLabel}>あと</Text>
              <TextInput
                style={[styles.input, styles.periodInput]}
                value={periodValue}
                onChangeText={setPeriodValue}
                keyboardType="decimal-pad"
                placeholder={periodUnit === "年" ? "3" : "180"}
                placeholderTextColor="#C0B8B0"
                maxLength={5}
              />
              <View style={styles.unitToggle}>
                {(["年", "日"] as const).map((u) => (
                  <Pressable
                    key={u}
                    style={[styles.unitBtn, periodUnit === u && styles.unitBtnActive]}
                    onPress={() => setPeriodUnit(u)}
                  >
                    <Text style={[styles.unitBtnText, periodUnit === u && styles.unitBtnTextActive]}>{u}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Field>
        )}

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
  container: { padding: 24, gap: 24, backgroundColor: "#FBF8F3", flexGrow: 1 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#9B9B9B", textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: "#FFFFFF", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: "#2C2C2C",
    borderWidth: 1.5, borderColor: "#E8E2DA",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: "#E8E2DA", backgroundColor: "#FFFFFF",
  },
  chipSelected: { backgroundColor: "#C4956A", borderColor: "#C4956A" },
  chipText: { fontSize: 14, color: "#5C5552", fontWeight: "500" },
  chipTextSelected: { color: "#FFFFFF" },
  customFreqRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  customFreqInput: { flex: 1, paddingVertical: 10 },
  customFreqActive: { borderColor: "#C4956A" },
  freqUnit: { fontSize: 15, color: "#9B9B9B" },
  modeToggle: { flexDirection: "row", gap: 10 },
  modeBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center",
    borderWidth: 1.5, borderColor: "#E8E2DA", backgroundColor: "#FFFFFF", gap: 3,
  },
  modeBtnActive: { backgroundColor: "#C4956A", borderColor: "#C4956A" },
  modeBtnText: { fontSize: 15, fontWeight: "600", color: "#5C5552" },
  modeBtnTextActive: { color: "#FFFFFF" },
  modeSubText: { fontSize: 11, color: "#B0A89E" },
  modeSubTextActive: { color: "rgba(255,255,255,0.8)" },
  periodRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  periodLabel: { fontSize: 15, color: "#9B9B9B" },
  periodInput: { flex: 1, paddingVertical: 10 },
  unitToggle: { flexDirection: "row", borderRadius: 10, borderWidth: 1.5, borderColor: "#E8E2DA", overflow: "hidden" },
  unitBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#FFFFFF" },
  unitBtnActive: { backgroundColor: "#C4956A" },
  unitBtnText: { fontSize: 15, fontWeight: "500", color: "#5C5552" },
  unitBtnTextActive: { color: "#FFFFFF" },
  saveBtn: { backgroundColor: "#C4956A", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
