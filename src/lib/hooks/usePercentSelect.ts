import { useSwapStore } from "lib/store";
import { useCallback } from "react";
import { useToken } from "./useToken";
import BN from "bignumber.js";
export const usePercentSelect = () => {
  const { updateStore, fromTokenAddress } = useSwapStore((s) => ({
    updateStore: s.updateStore,
    fromTokenAddress: s.fromTokenAddress,
  }));
  const fromTokenBalance = useToken(fromTokenAddress)?.balance;

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
