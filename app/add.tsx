import { useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createCounter } from "../db/database";
import { DEFAULT_LIFESPAN, EVENT_PRESETS, FREQUENCY_PRESETS, PERSON_PRESETS } from "../constants/presets";
import { calcRemainingTimes } from "../utils/calculations";

type Step = 1 | 2 | 3 | 4;

const ONBOARDING_KEY = "onboarding_completed";

export default function AddScreen() {
  const { fromOnboarding } = useLocalSearchParams<{ fromOnboarding?: string }>();
  const [step, setStep] = useState<Step>(1);
  const [personName, setPersonName] = useState("");
  const [eventName, setEventName] = useState("");
  const [frequencyPerYear, setFrequencyPerYear] = useState<number | null>(null);
  const [personAge, setPersonAge] = useState("");
  const [personLifespan, setPersonLifespan] = useState(String(DEFAULT_LIFESPAN));
  const [customPerson, setCustomPerson] = useState("");
  const [customEvent, setCustomEvent] = useState("");

  const effectivePerson = personName || customPerson;
  const effectiveEvent = eventName || customEvent;

  const preview = () => {
    if (!effectivePerson || !effectiveEvent || !frequencyPerYear || !personAge) return null;
    const age = parseInt(personAge, 10);
    const lifespan = parseInt(personLifespan, 10) || DEFAULT_LIFESPAN;
    if (isNaN(age)) return null;
    const remaining = Math.max(0, Math.floor((lifespan - age) * frequencyPerYear));
    return `${effectivePerson}とあと${remaining}回${effectiveEvent}できる`;
  };

  const canNext = () => {
    if (step === 1) return effectivePerson.trim().length > 0;
    if (step === 2) return effectiveEvent.trim().length > 0;
    if (step === 3) return frequencyPerYear !== null;
    if (step === 4) return personAge.trim().length > 0;
    return false;
  };

  const handleNext = () => {
    if (!canNext()) return;
    if (step < 4) {
      setStep((s) => (s + 1) as Step);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    const age = parseInt(personAge, 10);
    const lifespan = parseInt(personLifespan, 10) || DEFAULT_LIFESPAN;
    if (isNaN(age) || age < 0 || age > 130) {
      Alert.alert("年齢を正しく入力してください");
      return;
    }
    const birthYear = new Date().getFullYear() - age;
    try {
      const newId = await createCounter({
        person_name: effectivePerson.trim(),
        event_name: effectiveEvent.trim(),
        frequency_per_year: frequencyPerYear!,
        birth_year: birthYear,
        person_lifespan: lifespan,
        last_met_at: null,
      });
      if (fromOnboarding === "true") {
        await AsyncStorage.setItem(ONBOARDING_KEY, "true");
        router.back(); // モーダルを閉じる → onboardingのuseFocusEffectがホームへ遷移
      } else {
        router.back();
      }
    } catch {
      Alert.alert("エラー", "保存に失敗しました。もう一度お試しください。");
    }
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
        <StepIndicator current={step} />

        {step === 1 && (
          <StepView title="誰との時間を大切にしたいですか？">
            <ChipGroup
              items={PERSON_PRESETS}
              selected={personName}
              onSelect={(v) => { setPersonName(v); setCustomPerson(""); }}
            />
            <TextInput
              style={styles.input}
              placeholder="自由入力..."
              placeholderTextColor="#C0B8B0"
              value={customPerson}
              onChangeText={(t) => { setCustomPerson(t); setPersonName(""); }}
            />
          </StepView>
        )}

        {step === 2 && (
          <StepView title={`${effectivePerson}とどんな時間を過ごしたいですか？`}>
            <ChipGroup
              items={EVENT_PRESETS}
              selected={eventName}
              onSelect={(v) => { setEventName(v); setCustomEvent(""); }}
            />
            <TextInput
              style={styles.input}
              placeholder="自由入力..."
              placeholderTextColor="#C0B8B0"
              value={customEvent}
              onChangeText={(t) => { setCustomEvent(t); setEventName(""); }}
            />
          </StepView>
        )}

        {step === 3 && (
          <StepView title={`どれくらいの頻度で\n${effectiveEvent}していますか？`}>
            <ChipGroup
              items={FREQUENCY_PRESETS}
              selected={frequencyPerYear !== null ? String(frequencyPerYear) : ""}
              onSelect={(v) => setFrequencyPerYear(Number(v))}
              valueKey="value"
            />
          </StepView>
        )}

        {step === 4 && (
          <StepView title={`${effectivePerson}は今何歳ですか？`}>
            <TextInput
              style={[styles.input, styles.ageInput]}
              placeholder="例：68"
              placeholderTextColor="#C0B8B0"
              value={personAge}
              onChangeText={setPersonAge}
              keyboardType="number-pad"
              maxLength={3}
            />
            <View style={styles.lifespanRow}>
              <Text style={styles.lifespanLabel}>平均寿命</Text>
              <TextInput
                style={styles.lifespanInput}
                value={personLifespan}
                onChangeText={setPersonLifespan}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={styles.lifespanLabel}>歳</Text>
            </View>

            {preview() && (
              <View style={styles.previewCard}>
                <Text style={styles.previewText}>{preview()}</Text>
              </View>
            )}
          </StepView>
        )}

        <View style={styles.buttons}>
          {step > 1 && (
            <Pressable
              style={styles.backBtn}
              onPress={() => setStep((s) => (s - 1) as Step)}
            >
              <Text style={styles.backBtnText}>戻る</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.nextBtn, !canNext() && styles.nextBtnDisabled]}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>
              {step === 4 ? "作成する" : "次へ"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <View style={styles.stepRow}>
      {[1, 2, 3, 4].map((s) => (
        <View
          key={s}
          style={[styles.stepDot, s <= current && styles.stepDotActive]}
        />
      ))}
    </View>
  );
}

function StepView({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.stepView}>
      <Text style={styles.stepTitle}>{title}</Text>
      {children}
    </View>
  );
}

type ChipItem = { label: string; value: string | number };
function ChipGroup({
  items,
  selected,
  onSelect,
  valueKey = "value",
}: {
  items: ChipItem[];
  selected: string;
  onSelect: (v: string) => void;
  valueKey?: string;
}) {
  return (
    <View style={styles.chips}>
      {items.map((item) => {
        const val = String(item.value);
        const isSelected = selected === val;
        return (
          <Pressable
            key={val}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(val)}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
    gap: 32,
    backgroundColor: "#FBF8F3",
    flexGrow: 1,
  },
  stepRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8E2DA",
  },
  stepDotActive: {
    backgroundColor: "#C4956A",
    width: 24,
  },
  stepView: {
    gap: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2C2C2C",
    lineHeight: 32,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#E8E2DA",
    backgroundColor: "#FFFFFF",
  },
  chipSelected: {
    backgroundColor: "#C4956A",
    borderColor: "#C4956A",
  },
  chipText: {
    fontSize: 15,
    color: "#5C5552",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#FFFFFF",
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
  ageInput: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 20,
  },
  lifespanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lifespanLabel: {
    fontSize: 15,
    color: "#9B9B9B",
  },
  lifespanInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#2C2C2C",
    borderWidth: 1.5,
    borderColor: "#E8E2DA",
    width: 70,
    textAlign: "center",
  },
  previewCard: {
    backgroundColor: "#FDF2E8",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#C4956A",
  },
  previewText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C2C2C",
    lineHeight: 30,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
  },
  backBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#EEEAE4",
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7A7470",
  },
  nextBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#C4956A",
  },
  nextBtnDisabled: {
    backgroundColor: "#DEDAD5",
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
