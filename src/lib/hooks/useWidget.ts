import { useLiquidityHub } from "@orbs-network/liquidity-hub-ui";
import { useWidgetStore } from "lib/store";
import { usePriceUsd } from "./usePriceUsd";

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
