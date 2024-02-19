import { useContractCallback } from "@orbs-network/liquidity-hub-ui";
import { useMemo } from "react";

export const useContract = (address?: string) => {
  const getContract = useContractCallback();

  return useMemo(() => {
    if (!address) return undefined;
    return getContract(address);
  }, [address, getContract]);
};
