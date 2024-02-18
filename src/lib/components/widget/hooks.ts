import { useCallback } from "react";
import { useWidgetStore } from "./store";
import BN from "bignumber.js";
import { usePriceUsd, useTokenBalance } from "lib/hooks";
import { useLiquidityHub } from "lib/hooks/useLiquidityHub";

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


export const useWidget = () => {
  const store = useWidgetStore();
  const { data: fromTokenUsd } = usePriceUsd({
    address: store.fromToken?.address,
  });
  const { data: toTokenUsd } = usePriceUsd({ address: store.toToken?.address });

  return useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmountUI: store.fromAmount,
    fromTokenUsd,
    toTokenUsd,
  });
};
