import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Store {
  fromTokenAddress?: string;
  toTokenAddress?: string;
  fromAmount?: string;
  toAmount?: string;
  fetchingBalancesAfterTx?: boolean;
  swapTypeIsBuy?: boolean;
  updateStore: (value: Partial<Store>) => void;
  onFromAmountChange: (value: string) => void;
  onToAmountChange: (value: string) => void;
  onFromTokenChange: (value: string) => void;
  onToTokenChange: (value: string) => void;
  onSwitchTokens: () => void;
  reset: () => void;
}

const initialState: Partial<Store> = {
  fromTokenAddress: undefined,
  toTokenAddress: undefined,
  fromAmount: undefined,
  toAmount: undefined,
  fetchingBalancesAfterTx: false,
  swapTypeIsBuy: false,
};

export const useSwapStore = create<Store>((set) => ({
  ...initialState,
  updateStore: (value) => set({ ...value }),
  onFromAmountChange: (value) =>
    set({ fromAmount: value, swapTypeIsBuy: false }),
  onToAmountChange: (value) =>
    set({ toAmount: value, swapTypeIsBuy: true }),
  onFromTokenChange: (value) => set({ fromTokenAddress: value }),
  onToTokenChange: (value) => set({ toTokenAddress: value }),
  onSwitchTokens: () =>
    set((state) => ({
      fromTokenAddress: state.toTokenAddress,
      toTokenAddress: state.fromTokenAddress,
    })),
  reset: () => set({ ...initialState }),
}));


interface PersistedStore {
  password?: string;
  setPassword: (password: string) => void;
}

export const usePersistedStore = create(
  persist<PersistedStore>(
    (set) => ({
      password: undefined,
      tokens: {},
      setPassword: (password) => set({ password }),
    }),
    {
      name: `persisted-store`,
    }
  )
);
