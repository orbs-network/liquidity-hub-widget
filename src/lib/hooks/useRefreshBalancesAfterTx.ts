import { Token, useAccount, useWeb3 } from "@orbs-network/liquidity-hub-ui";
import { useQueryClient } from "@tanstack/react-query";
import { delay, getBalances } from "lib/utils";
import { useCallback } from "react";
import Web3 from "web3";
import { Balances } from "lib/type";
import { useMainStore } from "lib/store";
import { useShallow } from "zustand/react/shallow";
import { useTokenListBalances } from "./useTokenListBalances";
export function useRefreshBalancesAfterTx() {
  const web3 = useWeb3();
  const account = useAccount();
  const queryClient = useQueryClient();
  const { data: balances, refetch } = useTokenListBalances();
  const { fromToken, toToken, updateStore } = useMainStore(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      updateStore: s.updateStore,
    }))
  );

  return useCallback(async () => {
    if (!account || !web3 || !fromToken || !toToken || !balances) return;
    updateStore({ fetchingBalancesAfterTx: true });
    try {
      await loopBalances(web3, account, fromToken, toToken, balances);
      await refetch();
    } catch (error) {
      console.error("useRefreshBalancesAfterTx", error);
    } finally {
      updateStore({ fetchingBalancesAfterTx: false });
    }
  }, [account, web3, balances, fromToken, toToken, queryClient, updateStore]);
}

const loopBalances = async (
  web3: Web3,
  account: string,
  fromToken: Token,
  toToken: Token,
  currentBalances: Balances
) => {
  const newBalances = await getBalances([fromToken, toToken], web3, account);
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
