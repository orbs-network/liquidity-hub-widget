import { useSwapStore } from "lib/store";
import { useMemo } from "react";
import { useLiquidityHubData } from "./useLiquidityHubData";

export const useToAmount = () => {
  const { quote } = useLiquidityHubData();
  const toAmount = useSwapStore((s) => s.toAmount);
  return useMemo(() => {
    return {
      rawAmount: quote?.outAmount,
      uiAmount: quote?.outAmountUI,
    };
  }, [quote, toAmount]);
};
