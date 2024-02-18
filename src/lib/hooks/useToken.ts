import { eqIgnoreCase } from "@defi.org/web3-candies";
import { useMemo } from "react";
import { useTokens } from "./useTokens";

export const useToken = (address?: string) => {
  const { data: tokens, dataUpdatedAt } = useTokens();
  return useMemo(() => {
    if (!address || !tokens) return undefined;
    console.log({ address });

    return tokens.find((t) => eqIgnoreCase(t?.address || "", address));
  }, [address, dataUpdatedAt]);
};
