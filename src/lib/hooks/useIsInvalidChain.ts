import { useSharedContext } from "lib/context";
import { useMemo } from "react";

export const useIsInvalidChain = () => {
  const { chainId, partnerChainId } = useSharedContext();
  return useMemo(() => {
    return chainId !== partnerChainId;
  }, [chainId, partnerChainId]);
};
