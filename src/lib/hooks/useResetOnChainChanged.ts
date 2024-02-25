import { useChainId } from "@orbs-network/liquidity-hub-ui";
import { useMainStore } from "lib/store";
import { useEffect } from "react";

export function useResetOnChainChanged() {
  const { reset } = useMainStore();

  const chainId = useChainId();

  useEffect(() => {
    reset();
  }, [chainId, reset]);
}
