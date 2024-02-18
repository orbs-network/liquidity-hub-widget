import { useChainConfig } from "@orbs-network/liquidity-hub-lib";
import { useQuery } from "@tanstack/react-query";
import { useSharedContext } from "lib/context";
import { useSwapStore } from "lib/store";
import { tokensWithBalances } from "lib/util";
import { useIsInvalidChain } from "./useIsInvalidChain";
import { useWeb3 } from "./useWeb3";
import BN from "bignumber.js";
import _ from "lodash";
import { eqIgnoreCase, zeroAddress } from "@defi.org/web3-candies";
import { QUERY_KEYS } from "lib/consts";

export const useTokens = () => {
  const { account } = useSharedContext();
  const wrongChain = useIsInvalidChain();
  const web3 = useWeb3();
  const { updateStore, fromTokenAddress } = useSwapStore((s) => ({
    updateStore: s.updateStore,
    fromTokenAddress: s.fromTokenAddress,
  }));
  const chainConfig = useChainConfig();

  return useQuery({
    queryFn: async () => {
      let tokens = await chainConfig!.getTokens();
      tokens = await tokensWithBalances(tokens, web3, account);

      let sorted = _.orderBy(
        tokens,
        (t) => {
          return new BN(t.balance || "0");
        },
        ["desc"]
      );

      const isValidFromToken = _.find(sorted, (t) =>
        eqIgnoreCase(t.address, fromTokenAddress || "")
      );
      if (!isValidFromToken) {
        updateStore({ fromTokenAddress: sorted[1].address });
      }
      const nativeTokenIndex = _.findIndex(tokens, (t) =>
        eqIgnoreCase(t.address, zeroAddress)
      );

      const nativeToken = tokens[nativeTokenIndex];
      sorted = sorted.filter((t) => !eqIgnoreCase(t.address, zeroAddress));
      sorted.unshift(nativeToken);

      return sorted;
    },
    queryKey: [QUERY_KEYS.GET_TOKENS, chainConfig?.chainId, account, web3?.version],
    enabled: !!chainConfig && !!chainConfig && !wrongChain,
    refetchInterval: 60_000,
    staleTime: Infinity,
  });
};
