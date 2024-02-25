import { useLiquidityHub } from "@orbs-network/liquidity-hub-ui";
import { useMainStore } from "lib/store";

export const useLiquidityHubData = () => {
  const store = useMainStore();
  return useLiquidityHub({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmountUI: store.fromAmount,
  });
};
