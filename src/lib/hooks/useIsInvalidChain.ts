
import { useMainContext } from "lib/provider";
import { useMemo } from "react";

export const useIsInvalidChain = () => {
  const { chainId, partnerChainId } = useMainContext();
  return useMemo(() => {
    return chainId !== partnerChainId;
  }, [chainId, partnerChainId]);
};
