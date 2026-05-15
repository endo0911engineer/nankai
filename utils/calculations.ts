import { Counter } from "../types";

export function currentAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

export function calcRemainingTimes(counter: Counter): number {
  const age = currentAge(counter.birth_year);
  const yearsLeft = Math.max(0, counter.person_lifespan - age);
  return Math.floor(yearsLeft * counter.frequency_per_year);
}

export function formatFrequency(perYear: number): string {
  if (perYear >= 365) return "毎日";
  if (perYear >= 52) return "週1回";
  if (perYear >= 24) return "月2回";
  if (perYear >= 12) return "月1回";
  if (perYear >= 4) return "年4回";
  if (perYear >= 2) return "年2回";
  return "年1回";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}
