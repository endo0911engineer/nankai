import { PersonPreset, EventPreset, FrequencyPreset } from "../types";

export const PERSON_PRESETS: PersonPreset[] = [
  { label: "母", value: "母" },
  { label: "父", value: "父" },
  { label: "恋人", value: "恋人" },
  { label: "子供", value: "子供" },
  { label: "親友", value: "親友" },
  { label: "ペット", value: "ペット" },
];

export const EVENT_PRESETS: EventPreset[] = [
  { label: "ご飯", value: "ご飯" },
  { label: "旅行", value: "旅行" },
  { label: "桜を見る", value: "桜を見る" },
  { label: "ハグ", value: "ハグ" },
  { label: "散歩", value: "散歩" },
  { label: "誕生日", value: "誕生日" },
  { label: "クリスマス", value: "クリスマス" },
];

export const FREQUENCY_PRESETS: FrequencyPreset[] = [
  { label: "毎日", value: 365 },
  { label: "週1回", value: 52 },
  { label: "月2回", value: 24 },
  { label: "月1回", value: 12 },
  { label: "年4回", value: 4 },
  { label: "年2回", value: 2 },
  { label: "年1回", value: 1 },
];

export const DEFAULT_LIFESPAN = 85;
