import { useLiquidityHubPersistedStore } from "lib/store/main";
import { Order } from "lib/type";
import { useCallback } from "react";
import { useMainContext } from "../provider";


export const useAddOrder = () => {
  const addOrder = useLiquidityHubPersistedStore((s) => s.addOrder);
  const { account, chainId } = useMainContext();
  return useCallback(
    (order: Order) => {
      if (!account || !chainId) return;
      addOrder(account, chainId, order);
    },
    [addOrder, account, chainId]
  );
};
