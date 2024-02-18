import { useSwapStore } from "lib/store";
import { useCallback } from "react";
import { useTokens } from "./useTokens";

export const useRefetchBalancesCallback = () => {
  const updateStore = useSwapStore((s) => s.updateStore);
  const { refetch } = useTokens();

  return useCallback(async () => {
    try {
      updateStore({
        fetchingBalancesAfterTx: true,
      });
      await refetch();
    } catch (error) {
      console.error("Failed to refetch balances after tx", error);
    } finally {
      updateStore({
        fetchingBalancesAfterTx: false,
      });
    }
  }, [updateStore]);
};
