export type Counter = {
  id: number;
  person_name: string;
  event_name: string;
  frequency_per_year: number;
  birth_year: number;
  person_lifespan: number;
  last_met_at: string | null;
  created_at: string;
};

export type Memory = {
  id: number;
  counter_id: number;
  photo_uri: string | null;
  memo: string | null;
  met_at: string;
  created_at: string;
};

export type PersonPreset = {
  label: string;
  value: string;
};

export type EventPreset = {
  label: string;
  value: string;
};

export type FrequencyPreset = {
  label: string;
  value: number;
};
