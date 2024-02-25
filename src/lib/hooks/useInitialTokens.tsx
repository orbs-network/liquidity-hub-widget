import { eqIgnoreCase } from "@defi.org/web3-candies";
import { Token } from "@orbs-network/liquidity-hub-ui";
import { useMainStore } from "lib/store";
import { useEffect } from "react";
import { useTokens } from "./useTokens";
import { useTokenListBalances } from "./useTokenListBalances";
import { useShallow } from "zustand/react/shallow";

const findToken = (tokens: Token[], addressOrSymbol: string) => {
  const res =  tokens.find(
    (t) =>
      eqIgnoreCase(t.address, addressOrSymbol) || t.symbol === addressOrSymbol
  );    
  return res;
};

export const useInitialTokens = (
  fromTokeAddressOrSymbol?: string,
  toTokenAddressOrSymbol?: string
) => {
  const { updateStore, fromToken, toToken } = useMainStore(
    useShallow((s) => ({
      updateStore: s.updateStore,
      fromToken: s.fromToken,
      toToken: s.toToken,
    }))
  );

  const balances = useTokenListBalances().data;

  const tokens = useTokens();

  useEffect(() => {
    if(!tokens) return;
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
    if (!balances) return;

    if (!fromToken) {
      updateStore({ fromToken: tokens[1] });
    }
    if (!toToken) {
      updateStore({ toToken: tokens[2] });
    }
  }, [
    balances,
    fromToken,
    toToken,
    fromTokeAddressOrSymbol,
    toTokenAddressOrSymbol,
    tokens,
  ]);
};
