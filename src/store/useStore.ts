// src/store/useStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  walletAddress: string;
  points: number;
}

interface CasinoState {
  // Casino entry state
  hasEnteredCasino: boolean;
  lastEntryTime: number | null;
  isLoading: boolean;

  // User state
  user: User | null;
  walletAddress: string | null;
  points: number;

  // Casino actions
  setHasEnteredCasino: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  enterCasino: () => void;
  resetEntry: () => void;
  checkRecentEntry: () => boolean;

  // User actions
  setUser: (user: User) => void;
  setPoints: (points: number) => void;
  updatePoints: (
    operation: "add" | "subtract" | "set",
    amount: number
  ) => Promise<void>;
  clearUser: () => void;

  // Music state
  shouldPlayMusic: boolean;
  setShouldPlayMusic: (value: boolean) => void;
}

export const useCasinoStore = create<CasinoState>()(
  persist(
    (set, get) => ({
      // Casino entry state
      hasEnteredCasino: false,
      lastEntryTime: null,
      isLoading: true,

      // User state
      user: null,
      walletAddress: null,
      points: 0,

      // Casino actions
      setHasEnteredCasino: (value) => set({ hasEnteredCasino: value }),
      setIsLoading: (value) => set({ isLoading: value }),
      enterCasino: () =>
        set({
          hasEnteredCasino: true,
          lastEntryTime: Date.now(),
        }),
      resetEntry: () =>
        set({
          hasEnteredCasino: false,
          lastEntryTime: null,
        }),
      checkRecentEntry: () => {
        const state = get();
        if (!state.lastEntryTime) return false;

        const timeDiff = Date.now() - state.lastEntryTime;
        const threeMinutes = 3 * 60 * 1000; // 3 minutes in milliseconds

        return timeDiff < threeMinutes;
      },

      // User actions
      setUser: (user) =>
        set({
          user,
          walletAddress: user.walletAddress,
          points: user.points,
        }),
      setPoints: (points) => set({ points }),
      updatePoints: async (operation, amount) => {
        const { walletAddress } = get();
        if (!walletAddress) return;

        try {
          const response = await fetch("/api/user/points", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletAddress,
              points: amount,
              operation,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            set({ points: data.points });
          }
        } catch (error) {
          console.error("Failed to update points:", error);
        }
      },
      clearUser: () =>
        set({
          user: null,
          walletAddress: null,
          points: 0,
        }),
      shouldPlayMusic: false,
      setShouldPlayMusic: (value) => set({ shouldPlayMusic: value }),
    }),
    {
      name: "casino-storage",
      partialize: (state) => ({
        hasEnteredCasino: state.hasEnteredCasino,
        lastEntryTime: state.lastEntryTime,
        user: state.user,
        walletAddress: state.walletAddress,
        points: state.points,
      }),
    }
  )
);

// Export user-specific store hooks for convenience
export const useUserStore = () => {
  const store = useCasinoStore();
  return {
    user: store.user,
    walletAddress: store.walletAddress,
    points: store.points,
    setUser: store.setUser,
    setPoints: store.setPoints,
    updatePoints: store.updatePoints,
    clearUser: store.clearUser,
  };
};
