import { eqIgnoreCase, Token, useIsInvalidChain } from "@orbs-network/liquidity-hub-ui";
import { useMainStore } from "lib/store";
import { useEffect } from "react";
import { useTokens } from "./useTokens";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";

const findToken = (tokens: Token[], addressOrSymbol: string) => {
  const res = tokens.find(
    (t) =>
      eqIgnoreCase(t.address, addressOrSymbol) || t.symbol === addressOrSymbol
  );
  return res;
};

export const useInitialTokens = (
  fromTokeAddressOrSymbol?: string,
  toTokenAddressOrSymbol?: string
) => {
  const invalidChain  =useIsInvalidChain()
  const { updateStore, fromToken, toToken } = useMainStore(
    useShallow((s) => ({
      updateStore: s.updateStore,
      fromToken: s.fromToken,
      toToken: s.toToken,
    }))
  );

  const tokens = useTokens();

  useEffect(() => {
    if (!tokens || invalidChain) return;
    if (!fromToken && fromTokeAddressOrSymbol) {
      updateStore({
        fromToken: findToken(tokens, fromTokeAddressOrSymbol),
      });
    }
    if (!toToken && toTokenAddressOrSymbol) {
      updateStore({
        toToken: findToken(tokens, toTokenAddressOrSymbol),
      });
    }
  }, [
    fromToken,
    toToken,
    fromTokeAddressOrSymbol,
    toTokenAddressOrSymbol,
    tokens,
    invalidChain,
  ]);
};
