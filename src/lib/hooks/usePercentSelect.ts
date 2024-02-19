import { useWidgetStore } from "lib/store";
import { useCallback } from "react";
import { useTokenBalance } from "./useTokens";
import BN from "bignumber.js";

export const usePercentSelect = () => {
  const { updateStore, fromToken } = useWidgetStore((s) => ({
    updateStore: s.updateStore,
    fromToken: s.fromToken,
  }));
  const fromTokenBalance = useTokenBalance(fromToken?.address);

  return useCallback(
    (percent: number) => {
      updateStore({
        fromAmount: new BN(fromTokenBalance || "0")
          .multipliedBy(percent)
          .toString(),
      });
    },
    [updateStore, fromTokenBalance]
  );
};
