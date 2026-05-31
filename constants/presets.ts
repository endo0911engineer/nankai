import { PersonPreset, EventPreset, FrequencyPreset } from "../types";

export const PERSON_PRESETS: PersonPreset[] = [
  { label: "母", value: "母" },
  { label: "父", value: "父" },
  { label: "祖母", value: "祖母" },
  { label: "祖父", value: "祖父" },
  { label: "恋人", value: "恋人" },
  { label: "夫", value: "夫" },
  { label: "妻", value: "妻" },
  { label: "子供", value: "子供" },
  { label: "友人", value: "友人" },
  { label: "兄", value: "兄" },
  { label: "姉", value: "姉" },
  { label: "弟", value: "弟" },
  { label: "妹", value: "妹" },
  { label: "ペット", value: "ペット" },
];

export const EVENT_PRESETS: EventPreset[] = [
  { label: "ご飯", value: "ご飯を食べられる" },
  { label: "旅行", value: "旅行できる" },
  { label: "お出かけ", value: "お出かけできる" },
  { label: "桜", value: "一緒に桜を見られる" },
  { label: "花火", value: "一緒に花火を見られる" },
  { label: "紅葉", value: "一緒に紅葉を見られる" },
  { label: "初日の出", value: "一緒に初日の出を見られる" },
  { label: "ハグ", value: "ハグできる" },
  { label: "散歩", value: "一緒に散歩できる" },
  { label: "電話", value: "電話できる" },
  { label: "誕生日", value: "誕生日を一緒に祝える" },
  { label: "クリスマス", value: "クリスマスを一緒に過ごせる" },
  { label: "お正月", value: "お正月を一緒に過ごせる" },
  { label: "お盆", value: "お盆を一緒に過ごせる" },
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
