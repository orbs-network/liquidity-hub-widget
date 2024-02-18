import { sendAndWaitForConfirmations } from "@defi.org/web3-candies";
import { useSwapState } from "lib/store/main";
import { STEPS, Token } from "lib/type";
import { counter } from "lib/util";
import { useCallback } from "react";
import { swapAnalytics } from "../analytics";
import { useMainContext } from "../provider";
import { useChainConfig } from "./useChainConfig";
import { useContractCallback } from "./useContractCallback";

export const useWrap = (fromToken?: Token) => {
  const { account } = useMainContext();
  const { updateState, setFromAddress } = useSwapState((s) => ({
    updateState: s.updateState,
    setFromAddress: s.setFromAddress,
  }));

  const wTokenAddress = useChainConfig()?.wToken?.address;
  const getContract = useContractCallback();
  return useCallback(
    async (srcAmount: string) => {
      const count = counter();
      swapAnalytics.onWrapRequest();

      if (!account) {
        throw new Error("Missing account");
      }
      if (!fromToken) {
        throw new Error("Missing from token");
      }
      const fromTokenContract = getContract(fromToken?.address);
      if (!fromTokenContract) {
        throw new Error("Missing from token contract");
      }
      updateState({ swapStatus: "loading", currentStep: STEPS.WRAP });
      try {
        if (!fromToken || !srcAmount) return;
        const tx = fromTokenContract?.methods?.deposit();
        await sendAndWaitForConfirmations(tx, {
          from: account,
          value: srcAmount,
        });

        wTokenAddress && setFromAddress?.(wTokenAddress);
        swapAnalytics.onWrapSuccess(count());
        updateState({ swapStatus: "success" });

        return true;
      } catch (error: any) {
        swapAnalytics.onWrapFailed(error.message, count());
        throw new Error(error.message);
      }
    },
    [
      account,
      updateState,
      getContract,
      fromToken,
      setFromAddress,
      wTokenAddress,
    ]
  );
};
