import BN from "bignumber.js";
import {
  eqIgnoreCase,
  getChainConfig,
  isNativeAddress,
  useChainConfig,
  useIsInvalidChain,
  useSupportedChains,
  useSwitchNetwork,
} from "@orbs-network/liquidity-hub-ui";
import { useTokenListBalance } from "./useTokenListBalance";
import { useMainStore } from "lib/store";
import { useLiquidityHubData } from "./useLiquidityHubData";
import { useCallback, useMemo } from "react";
import { useUnwrap } from "./useUnwrap";

export const useShowConfirmationButton = (
  fromTokenUsd: string | number,
  toTokenUsd: string | number
) => {
  const { fromToken, toToken, fromAmount } = useMainStore((s) => ({
    fromToken: s.fromToken,
    toToken: s.toToken,
    fromAmount: s.fromAmount,
  }));
  const { quote, confirmSwap, quoteLoading, quoteError } =
    useLiquidityHubData();
  const toAmount = quote?.outAmountUI;
  const supportedChains = useSupportedChains();
  const { mutate: switchNetwork, isPending: switchNetworkLoading } =
    useSwitchNetwork();
  const wrongChain = useIsInvalidChain();
  const fromAmountBN = new BN(fromAmount || "0");
  const fromTokenBalance = useTokenListBalance(fromToken?.address);
  const fromTokenBalanceBN = new BN(fromTokenBalance || "0");
  const wToken = useChainConfig()?.wToken?.address;
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrap();

  const isLoading = quoteLoading || switchNetworkLoading || unwrapLoading;

  const _confirmSwap = useCallback(() => {
    return confirmSwap({
      fromTokenUsd,
      toTokenUsd,
    });
  }, [confirmSwap, fromTokenUsd, toTokenUsd]);

  return useMemo(() => {
    if (wrongChain) {
      return {
        disabled: false,
        text: `Switch to ${getChainConfig(supportedChains[0])?.chainName}`,
        onClick: () => switchNetwork?.(supportedChains[0]!),
        switchNetworkLoading,
        isLoading,
      };
    }

    if (!fromToken || !toToken) {
      return {
        disabled: true,
        text: "Select tokens",
      };
    }

    if (BN(fromAmount || 0).isZero() && BN(toAmount || 0).isZero()) {
      return {
        disabled: true,
        text: "Enter an amount",
      };
    }

    if (
      eqIgnoreCase(fromToken.address, wToken || "") &&
      isNativeAddress(toToken.address || "")
    ) {
      return {
        text: "Unwrap",
        onClick: unwrap,
        uwrapLoading: unwrapLoading,
        isLoading,
      };
    }
    if (quoteLoading) {
      return {
        disabled: false,
        text: "",
        quoteLoading,
        isLoading,
      };
    }

    if (fromAmountBN.gt(fromTokenBalanceBN)) {
      return {
        disabled: true,
        text: "Insufficient balance",
      };
    }

    if (quoteError || BN(toAmount || "0").isZero()) {
      return {
        disabled: true,
        text: "No liquidity",
      };
    }

    return {
      disabled: false,
      text: "Swap",
      onClick: _confirmSwap,
    };
  }, [
    wrongChain,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    fromTokenBalance,
    quoteError,
    switchNetwork,
    switchNetworkLoading,
    _confirmSwap,
    quoteLoading,
    isLoading,
  ]);
};
