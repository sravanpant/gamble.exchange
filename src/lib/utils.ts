// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SpinnerSection, SPINNER_SECTIONS } from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTimeRemaining = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
};

export const getWeightedRandomSection = (): {
  section: SpinnerSection;
  index: number;
} => {
  const totalWeight = SPINNER_SECTIONS.reduce(
    (sum, section) => sum + section.probability,
    0
  );
  let random = Math.random() * totalWeight;

  for (let i = 0; i < SPINNER_SECTIONS.length; i++) {
    random -= SPINNER_SECTIONS[i].probability;
    if (random <= 0) {
      return { section: SPINNER_SECTIONS[i], index: i };
    }
  }

  return { section: SPINNER_SECTIONS[0], index: 0 };
};
