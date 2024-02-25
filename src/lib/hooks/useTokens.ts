import BN from "bignumber.js";
import _ from "lodash";
import { eqIgnoreCase, zeroAddress } from "@defi.org/web3-candies";
import { useTokensList } from "./useTokenList";
import { useTokenListBalances } from "./useTokenListBalances";
import { useMemo } from "react";
import { Token } from "@orbs-network/liquidity-hub-ui";
import { useDebounce } from "./useDebounce";

const filterTokens = (list?: Token[], filterValue?: string) => {
  if (!filterValue) return list;

  if (!list) return [];

  return list.filter((it) => {
    return (
      it.symbol.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0 ||
      eqIgnoreCase(it.address, filterValue)
    );
  });
};

export const useTokens = (filter?: string) => {
  const { data: list } = useTokensList();
  const { data: balances } = useTokenListBalances();
  const debounedFilter = useDebounce(filter, 200);

  const tokens = useMemo(() => {
    let tokens = list;
    if (!tokens) {
      return [];
    }
    if (!balances) {
      return tokens;
    }
    let sorted = _.orderBy(
      tokens,
      (t) => {
        return new BN(balances?.[t.address] || "0");
      },
      ["desc"]
    );

    const nativeTokenIndex = _.findIndex(sorted, (t) =>
      eqIgnoreCase(t.address, zeroAddress)
    );

    if (nativeTokenIndex !== -1) {
      const nativeToken = sorted[nativeTokenIndex];
      sorted = sorted.filter((t) => !eqIgnoreCase(t.address, zeroAddress));
      sorted.unshift(nativeToken);
    }

    return sorted;
  }, [balances, list]);

  return useMemo(() => {
    if (debounedFilter) {
      return filterTokens(tokens, debounedFilter);
    }
    return tokens;
  }, [tokens, debounedFilter]);
};
