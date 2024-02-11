import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Token } from "./type";

export interface MainStore {
  updateStore: (value: Partial<MainStore>) => void;
}

export const useMainStore = create<MainStore>((set) => ({
  updateStore: (value) => set({ ...value }),
}));

interface Store {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  toAmount?: string;
  fetchingBalancesAfterTx?: boolean;
  swapTypeIsBuy?: boolean;
  updateStore: (value: Partial<Store>) => void;
  onFromAmountChange: (value: string) => void;
  onToAmountChange: (value: string) => void;
  onFromTokenChange: (value: Token) => void;
  onToTokenChange: (value: Token) => void;
  onSwitchTokens: () => void;
  reset: () => void;
}

const initialState: Partial<Store> = {
  fromToken: undefined,
  toToken: undefined,
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
  onFromTokenChange: (value) => set({ fromToken: value }),
  onToTokenChange: (value) => set({ toToken: value }),
  onSwitchTokens: () =>
    set((state) => ({
      fromToken: state.toToken,
      toToken: state.fromToken,
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
