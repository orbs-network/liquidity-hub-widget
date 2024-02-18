import { useQuery } from "@tanstack/react-query";
import { tokensWithBalances } from "lib/util";
import { useIsInvalidChain } from "./useIsInvalidChain";
import BN from "bignumber.js";
import _ from "lodash";
import { eqIgnoreCase, zeroAddress } from "@defi.org/web3-candies";
import { useChainConfig } from "./useChainConfig";
import { useMainContext } from "lib/provider";
import { QUERY_KEYS } from "lib/config/consts";
import { useMemo } from "react";

const useTokensList = () => {
  const { account, chainId } = useMainContext();
  const wrongChain = useIsInvalidChain();
  const web3 = useMainContext().web3;
  const chainConfig = useChainConfig();

  return useQuery({
    queryFn: async () => {
      if (account && !web3) return [];
      return chainConfig!.getTokens();
    },
    queryKey: [QUERY_KEYS.GET_TOKENS, chainId, account, web3?.version],
    enabled: !!chainConfig && !wrongChain,
    staleTime: Infinity,
  });
};

export const useBalances = () => {
  const { data: list } = useTokensList();
  const { chainId, account, web3 } = useMainContext();
  return useQuery({
    queryKey: [QUERY_KEYS.BALANCES, chainId, account],
    queryFn: async () => {
      const res = await tokensWithBalances(list!, web3, account);
      return _.mapValues(_.keyBy(res, "address"), "balance");
    },
    enabled: !!list && !!web3,
    refetchInterval: 60_000,
    staleTime: Infinity,
  });
};

export const useSortedTokens = () => {
  const {
    data: list,
    isLoading,
    dataUpdatedAt: listUpdatedAt,
  } = useTokensList();
  const { data: balances, dataUpdatedAt: balancesUpdatedAt } = useBalances();

  const tokens = useMemo(() => {
    let sorted = _.orderBy(
      list,
      (t) => {
        return new BN(balances?.[t.address] || "0");
      },
      ["desc"]
    );

    const nativeTokenIndex = _.findIndex(sorted, (t) =>
      eqIgnoreCase(t.address, zeroAddress)
    );

    const nativeToken = sorted[nativeTokenIndex];
    sorted = sorted.filter((t) => !eqIgnoreCase(t.address, zeroAddress));
    sorted.unshift(nativeToken);

    return sorted;
  }, [listUpdatedAt, balancesUpdatedAt]);

  return {
    sortedTokens: tokens,
    isLoading,
    dateUpdatedAt: balancesUpdatedAt,
  };
};

export const useTokenBalance = (address?: string) => {
  const { data: balances } = useBalances();
  return !address ? "0" : balances?.[address] || "0";
};
