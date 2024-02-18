import { getChainConfig, useToAmount } from "lib";
import { useSharedContext } from "lib/context";
import { useSwapStore } from "lib/store";
import { useCallback } from "react";
import { useIsInvalidChain } from "./useIsInvalidChain";
import { useLiquidityHubData } from "./useLiquidityHubData";
import { useRefetchBalancesCallback } from "./useRefetchBalances";
import BN from "bignumber.js";
import { useSwitchNetwork } from "./useSwitchNetwork";
import { useToken } from "./useToken";
import { isNativeAddress } from "@defi.org/web3-candies";
export const useTradeButton = () => {
  const { updateStore, fromAmount, fromTokenAddress, toTokenAddress } =
    useSwapStore((s) => ({
      fromAmount: s.fromAmount,
      updateStore: s.updateStore,
      fromTokenAddress: s.fromTokenAddress,
      toTokenAddress: s.toTokenAddress,
    }));
  const {
    confirmSwap,
    swapLoading,
    quote,
    quoteLoading,
    quoteError,
    analytics: { initSwap },
  } = useLiquidityHubData();
  const toAmount = useToAmount();
  const refetchBalances = useRefetchBalancesCallback();

  const swap = useCallback(async () => {
    initSwap();

    confirmSwap({
      onSuccess: () => {
        refetchBalances();
        updateStore({
          fromAmount: "",
        });
      },
    });
  }, [confirmSwap, refetchBalances, updateStore, initSwap]);

  const { onConnect, account, partnerChainId } = useSharedContext();
  const { mutate: switchNetwork, isLoading: switchNetworkLoading } =
    useSwitchNetwork();
  const wrongChain = useIsInvalidChain();
  const outAmount = quote?.outAmount;
  const fromToken = useToken(fromTokenAddress);
  const toToken = useToken(toTokenAddress);

  if (!account) {
    return {
      disabled: false,
      text: "Connect Wallet",
      onClick: onConnect,
    };
  }

  if (wrongChain) {
    return {
      disabled: false,
      text: `Switch to ${getChainConfig(partnerChainId)?.chainName}`,
      onClick: () => switchNetwork?.(partnerChainId!),
      isLoading: switchNetworkLoading,
    };
  }

  if (!fromToken || !toToken) {
    return {
      disabled: true,
      text: "Select tokens",
    };
  }

  if (BN(fromAmount || 0).isZero() && BN(toAmount?.rawAmount || 0).isZero()) {
    return {
      disabled: true,
      text: "Enter an amount",
    };
  }

  if (quoteLoading) {
    return {
      disabled: false,
      text: "",
      isLoading: true,
    };
  }

  const fromAmountBN = new BN(fromAmount || "0");
  const fromTokenBalanceBN = new BN(fromToken.balance || "0");
  if (fromAmountBN.gt(fromTokenBalanceBN)) {
    return {
      disabled: true,
      text: "Insufficient balance",
    };
  }

  if (quoteError || BN(outAmount || "0").isZero()) {
    return {
      disabled: true,
      text: "No liquidity",
    };
  }
  if (isNativeAddress(fromToken.address)) {
    return {
      disabled: false,
      text: "Wrap",
    };
  }
  return {
    disabled: false,
    text: "Swap",
    onClick: swap,
    isLoading: swapLoading,
  };
};
