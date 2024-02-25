import { useMainStore } from "lib/store";
import { useCallback } from "react";
import BN from "bignumber.js";
import { useTokenListBalance } from "./useTokenListBalance";
import { useShallow } from "zustand/react/shallow";

export const usePercentSelect = () => {
  const { updateStore, fromToken } = useMainStore(
    useShallow((s) => ({
      updateStore: s.updateStore,
      fromToken: s.fromToken,
    }))
  );

  const fromTokenBalance = useTokenListBalance(fromToken?.address);

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
