import { useMemo } from "react";
import { useContractCallback } from "./useContractCallback";

export const useContract = (address?: string) => {
  const getContract = useContractCallback();

  return useMemo(() => {
    if (!address) return undefined;
    return getContract(address);
  }, [address, getContract]);
};
