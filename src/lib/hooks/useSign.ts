import { setWeb3Instance, signEIP712 } from "@defi.org/web3-candies";
import { useSwapState } from "lib/store/main";
import { STEPS } from "lib/type";
import { counter } from "lib/util";
import { useCallback } from "react";
import { swapAnalytics } from "../analytics";
import { useMainContext } from "../provider";


export const useSign = () => {
  const { account, web3 } = useMainContext();
  const updateState = useSwapState((s) => s.updateState);

  return useCallback(
    async (permitData: any) => {
      const count = counter();
      swapAnalytics.onSignatureRequest();
      updateState({ swapStatus: "loading", currentStep: STEPS.SIGN });
      try {
        if (!account || !web3) {
          throw new Error("No account or web3");
        }

        setWeb3Instance(web3);
        const signature = await signEIP712(account, permitData);
        swapAnalytics.onSignatureSuccess(signature, count());
        updateState({ swapStatus: "success" });
        return signature;
      } catch (error: any) {
        swapAnalytics.onSignatureFailed(error.message, count());
        throw new Error(error.message);
      }
    },
    [updateState, account, web3]
  );
};
