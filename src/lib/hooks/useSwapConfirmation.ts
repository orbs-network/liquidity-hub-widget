import { useSwapState } from "lib/store/main";
import { amountUi } from "lib/util";
import { useMemo } from "react";
import BN from "bignumber.js";
import { isNativeAddress } from "@defi.org/web3-candies";
import { useSwapCallback } from "./useSwap";
import { useAllowance } from "./useAllowance";
import { useFormatNumber } from "./useFormatNumber";

const useAmounts = () => {
  const store = useSwapState();

  return useMemo(() => {
    return {
      fromAmount: {
        value: store.fromAmount,
        ui: amountUi(store.fromToken?.decimals, new BN(store.fromAmount || 0)),
      },
      toAmount: {
        value: store.quote?.outAmount,
        ui: amountUi(
          store.toToken?.decimals,
          new BN(store.quote?.outAmount || 0)
        ),
      },
    };
  }, [store.fromToken, store.toToken, store.fromAmount, store.quote]);
};

export const useSwapConfirmationButton = () => {
  const store = useSwapState();
  const { fromAmount } = useAmounts();

  const { data: approved, isLoading: allowanceQueryLoading } = useAllowance(
    store.fromToken,
    fromAmount.value
  );
 

  const swapCallback = useSwapCallback({
    fromToken: store.fromToken,
    fromAmount: fromAmount.value,
    toToken: store.toToken,
    quote: store.quote,
    approved,
  });

  return useMemo(() => {
    const getText = () => {
      if (isNativeAddress(store.fromToken?.address || ""))
        return "Wrap and swap";
      if (!approved) return "Approve and swap";
      return "Sign and Swap";
    };

    return {
      text: getText(),
      onClick: swapCallback,
      isPending: store.swapStatus === "loading" || allowanceQueryLoading
    };
  }, [approved, store.fromToken, store.swapStatus, swapCallback]);
};

export const useSwapConfirmation = () => {
  const store = useSwapState();
  const { fromAmount, toAmount } = useAmounts();

  const _fromAmountUI = useFormatNumber({ value: fromAmount.ui });
  const _toAmountUI = useFormatNumber({ value: toAmount.ui });

  return {
    currentStep: store.currentStep,
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount: fromAmount.value,
    fromAmountUI: _fromAmountUI,
    fromTokenUsd: store.fromTokenUsd,
    toTokenUsd: store.toTokenUsd,
    txHash: store.txHash,
    swapStatus: store.swapStatus,
    swapError: store.swapError,
    toAmount: toAmount.value,
    toAmountUI: _toAmountUI,
    showSubmitModal: store.showWizard,
  };
};
