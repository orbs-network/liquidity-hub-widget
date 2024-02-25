import { useSwapButton as useLHSwapButton } from "@orbs-network/liquidity-hub-ui";
import { useCallback } from "react";
import { useRefreshBalancesAfterTx } from "./useRefreshBalancesAfterTx";

export const useSwapButton = () => {
  const { swap, ...rest } = useLHSwapButton();
  const refreshBalances = useRefreshBalancesAfterTx();

  const _swap = useCallback(
    (onSuccess?: () => void) => {
      swap({
        onSuccess: () => {
          refreshBalances();
          onSuccess?.();
        },
      });
    },
    [swap, refreshBalances]
  );

  return {
    swap: _swap,
    ...rest,
  };
};
