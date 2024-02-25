import BN from "bignumber.js";
import { isNativeAddress } from "@defi.org/web3-candies";
import {
  getChainConfig,
  useIsInvalidChain,
  usePartnerChainId,
  useSwitchNetwork,
} from "@orbs-network/liquidity-hub-ui";
import { useTokenListBalance } from "./useTokenListBalance";
import { useMainStore } from "lib/store";
import { useLiquidityHubData } from "./swap/useLiquidityHubData";
import { useCallback, useMemo } from "react";

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
  const partnerChainId = usePartnerChainId();
  const { mutate: switchNetwork, isPending: switchNetworkLoading } =
    useSwitchNetwork();
  const wrongChain = useIsInvalidChain();
  const fromAmountBN = new BN(fromAmount || "0");
  const fromTokenBalance = useTokenListBalance(fromToken?.address);
  const fromTokenBalanceBN = new BN(fromTokenBalance || "0");

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
        text: `Switch to ${getChainConfig(partnerChainId)?.chainName}`,
        onClick: () => switchNetwork?.(partnerChainId!),
        switchNetworkLoading,
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

    if (quoteLoading) {
      return {
        disabled: false,
        text: "",
        quoteLoading,
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
    if (isNativeAddress(fromToken.address)) {
      return {
        disabled: false,
        text: "Wrap",
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
    partnerChainId,
    _confirmSwap,
    quoteLoading,
  ]);
};
