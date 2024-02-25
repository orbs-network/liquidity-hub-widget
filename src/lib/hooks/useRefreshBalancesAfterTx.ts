import { Token, useAccount, useWeb3 } from "@orbs-network/liquidity-hub-ui";
import { useQueryClient } from "@tanstack/react-query";
import { delay, getBalances } from "lib/utils";
import { useCallback } from "react";
import { useQueryKeys } from "./useQueryKeys";
import Web3 from "web3";
import { Balances } from "lib/type";
import { useMainStore } from "lib/store";
import { useShallow } from "zustand/react/shallow";
export function useRefreshBalancesAfterTx() {
  const web3 = useWeb3();
  const account = useAccount();
  const queryClient = useQueryClient();
  const queryKey = useQueryKeys().balances;
  const { fromToken, toToken } = useMainStore(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
    }))
  );

  return useCallback(async () => {
    if (!account || !web3 || !fromToken || !toToken) return;
    const currentBalances =
      (queryClient.getQueryData(queryKey) as Balances) || {};
    const result = loopBalances(
      web3,
      account,
      fromToken,
      toToken,
      currentBalances
    );
    if (!result) return;
    queryClient.setQueryData(queryKey, (prevData: Balances = {}) => {
      return {
        ...prevData,
        ...result,
      };
    });
  }, [account, web3, queryKey, fromToken, toToken, queryClient]);
}

const loopBalances = async (
  web3: Web3,
  account: string,
  fromToken: Token,
  toToken: Token,
  currentBalances: Balances
) => {
  const newBalances = await getBalances([fromToken, toToken], web3, account);
  console.log("newBalances", newBalances);

  if (
    currentBalances[fromToken.address] !== newBalances[fromToken.address] &&
    currentBalances[toToken.address] !== newBalances[toToken.address]
  ) {
    return {
      [fromToken.address]: newBalances[fromToken.address],
      [toToken.address]: newBalances[toToken.address],
    };
  }
  console.log("waiting");
  await delay(3_000);
  console.log("refetching");
  loopBalances(web3, account, fromToken, toToken, currentBalances);
};
