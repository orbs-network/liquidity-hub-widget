import { useMainStore } from "lib/store";
import { useShallow } from "zustand/react/shallow";
import { useLiquidityHubData } from "./useLiquidityHubData";
import { useTokenListBalance } from "./useTokenListBalance";

export * from "./useTokens";
export * from "./usePriceUsd";
export * from "./useUsdAmount";
export * from "./useTokens";
export * from "./useTokenListBalance";
export * from "./useRefreshBalancesAfterTx";
export * from "./useShowConfirmationButton";
export * from "./useInitialTokens";
export * from "./useSwapButton";

export const useBalanceUpdatingAfterSwap = () => {
  return useMainStore(useShallow((s) => s.fetchingBalancesAfterTx));
};

export const useFromToken = () => {
  return useMainStore(useShallow((s) => s.fromToken));
};

export const useToToken = () => {
  return useMainStore(useShallow((s) => s.toToken));
};

export function useFromTokenPanel() {
  const { token, amount, onTokenSelect, onChange } = useMainStore((s) => ({
    token: s.fromToken,
    amount: s.fromAmount,
    onTokenSelect: s.onFromTokenChange,
    onChange: s.onFromAmountChange,
  }));
  const balance = useTokenListBalance(token?.address);

  return {
    token,
    amount,
    onTokenSelect,
    onChange,
    balance,
  };
}

export function useToTokenPanel() {
  const { token, onTokenSelect } = useMainStore((s) => ({
    token: s.toToken,
    onTokenSelect: s.onToTokenChange,
  }));

  const amount = useLiquidityHubData().quote?.outAmountUI;
  const balance = useTokenListBalance(token?.address);

  return {
    token,
    amount,
    onTokenSelect,
    balance,
  };
}

export function useSwapTokens() {
  return useMainStore((store) => store.onSwitchTokens);
}
