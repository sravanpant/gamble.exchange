// src/store/useStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  walletAddress: string;
  points: number;
  cryptoBalance: string; // Store as string to handle Decimal from Prisma
  isAdmin: boolean;
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
  cryptoBalance: string; // Added for crypto balance

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
  // New action for crypto balance
  setCryptoBalance: (balance: string) => void;
  updateCryptoBalance: (
    operation: "add" | "subtract" | "set",
    amount: number // Use number for amount passed from UI, convert to Decimal on backend
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
      cryptoBalance: '0.0', // Initialize crypto balance

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
          cryptoBalance: user.cryptoBalance, // Set crypto balance
        }),
      setPoints: (points) => {
        const user = get().user;
        if (user) {
          set({
            points,
            user: { ...user, points },
          });
        } else {
          set({ points });
        }
      },
      updatePoints: async (operation, amount) => {
        const state = get();
        if (!state.walletAddress) return;

        try {
          const response = await fetch("/api/user/points", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletAddress: state.walletAddress,
              points: amount,
              operation,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Update both top-level points and user points
            set({
              points: data.points,
              user: state.user
                ? { ...state.user, points: data.points }
                : state.user,
            });
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
      // New: Set crypto balance directly
      setCryptoBalance: (balance) => {
        const user = get().user;
        if (user) {
          set({
            cryptoBalance: balance,
            user: { ...user, cryptoBalance: balance },
          });
        } else {
          set({ cryptoBalance: balance });
        }
      },
      // New: Update crypto balance via API
      updateCryptoBalance: async (operation, amount) => {
        const state = get();
        if (!state.walletAddress) return;

        try {
          const response = await fetch("/api/user/crypto-balance", { // New API endpoint
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletAddress: state.walletAddress,
              amount: amount,
              operation,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Update both top-level cryptoBalance and user's cryptoBalance
            set({
              cryptoBalance: data.cryptoBalance,
              user: state.user
                ? { ...state.user, cryptoBalance: data.cryptoBalance }
                : state.user,
            });
          } else {
            console.error("Failed to update crypto balance:", response.statusText);
            // Optionally, throw an error or show a user-friendly message
          }
        } catch (error) {
          console.error("Failed to update crypto balance:", error);
        }
      },
    }),
    {
      name: "casino-storage",
      partialize: (state) => ({
        hasEnteredCasino: state.hasEnteredCasino,
        lastEntryTime: state.lastEntryTime,
        user: state.user,
        walletAddress: state.walletAddress,
        points: state.points,
        cryptoBalance: state.cryptoBalance,
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
    cryptoBalance: store.cryptoBalance,
    setUser: store.setUser,
    isAdmin: store.user?.isAdmin || false, 
    setPoints: store.setPoints,
    updatePoints: store.updatePoints,
    setCryptoBalance: store.setCryptoBalance,
    updateCryptoBalance: store.updateCryptoBalance,
    clearUser: store.clearUser,
  };
};
