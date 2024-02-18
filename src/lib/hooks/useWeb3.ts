import { useSharedContext } from "lib/context";
import { useMemo } from "react";
import Web3 from "web3";
export const useWeb3 = () => {
  const provider = useSharedContext().provider;
  return useMemo(() => {
    if (provider) return new Web3(provider);
  }, [provider]);
};
