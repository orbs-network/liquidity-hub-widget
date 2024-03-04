import { useAccount, useChainId } from "@orbs-network/liquidity-hub-ui";
import { QUERY_KEYS } from "lib/consts";
import {  useMemo } from "react";

export const useQueryKeys = () => {
  const account = useAccount();
  const chainId = useChainId();


  const balances = useMemo(() => {
    return [QUERY_KEYS.BALANCES, account, chainId];
  }, [chainId, account]);

  return {
    balances,
  };
};
