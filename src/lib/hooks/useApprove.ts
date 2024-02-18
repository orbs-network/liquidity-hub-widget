import { permit2Address, maxUint256, sendAndWaitForConfirmations } from "@defi.org/web3-candies";
import { useSwapState } from "lib/store/main";
import { STEPS } from "lib/type";
import { counter } from "lib/util";
import { useCallback } from "react";

import { swapAnalytics } from "../analytics";
import { useMainContext } from "../provider";

import { useContractCallback } from "./useContractCallback";

export const useApprove = () => {
  const { account } = useMainContext();
  const getContract = useContractCallback();
  const updateState = useSwapState((s) => s.updateState);
  return useCallback(
    async (fromTokenAddress?: string, srcAmount?: string) => {
      const count = counter();
      swapAnalytics.onApprovalRequest();
      if (!account) {
        throw new Error("No account");
      }
      updateState({ swapStatus: "loading", currentStep: STEPS.APPROVE });
      try {
        if (!fromTokenAddress || !srcAmount) {
          throw new Error("Missing data");
        }
        const fromTokenContract = getContract(fromTokenAddress);

        if (!fromTokenContract) {
          throw new Error("Missing contract");
        }
        const tx = fromTokenContract?.methods.approve(
          permit2Address,
          maxUint256
        );

        await sendAndWaitForConfirmations(tx, { from: account });
        swapAnalytics.onApprovalSuccess(count());
        updateState({ swapStatus: "success" });
      } catch (error: any) {
        swapAnalytics.onApprovalFailed(error.message, count());
        throw new Error(error.message);
      } finally {
      }
    },
    [account, updateState, getContract]
  );
};
