// src/constants/index.ts
export interface SpinnerSection {
  value: number;
  color: string;
  probability: number;
}

export const SPINNER_SECTIONS: SpinnerSection[] = [
  { value: 0, color: "#4B5563", probability: 40 },
  { value: 10, color: "#3B82F6", probability: 25 },
  { value: 20, color: "#8B5CF6", probability: 15 },
  { value: 50, color: "#EC4899", probability: 10 },
  { value: 100, color: "#F59E0B", probability: 7 },
  { value: 1000, color: "#10B981", probability: 3 },
];

export const COOLDOWN_HOURS = 24;
export const SKIP_COST = 100;
export const STORAGE_KEY = 'spinner_last_spin';
export const DAILY_SPIN_LIMIT = 10;