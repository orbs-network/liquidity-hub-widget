import { useLiquidityHub } from "@orbs-network/liquidity-hub-lib";
import { useSharedContext } from "lib/context";
import { useSwapStore } from "lib/store";
import { usePriceUsd } from "./usePriceUsd";
import { useToken } from "./useToken";

export const useLiquidityHubData = () => {
  const { fromAmount, fromTokenAddress, toTokenAddress } = useSwapStore(
    (s) => ({
      fromAmount: s.fromAmount,
      fromTokenAddress: s.fromTokenAddress,
      toTokenAddress: s.toTokenAddress,
    })
  );
  const fromToken = useToken(fromTokenAddress);
  const toToken = useToken(toTokenAddress);
  const fromTokenUsd = usePriceUsd(fromToken?.address).data;
  const toTokenUsd = usePriceUsd(toToken?.address).data;
  const { slippage } = useSharedContext();

  return useLiquidityHub({
    fromToken,
    toToken,
    fromAmountUI: fromAmount,
    toTokenUsd,
    fromTokenUsd,
    slippage,
  });
};
