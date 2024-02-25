import { useAccount, useIsInvalidChain, useWeb3 } from "@orbs-network/liquidity-hub-ui";
import { useQuery } from "@tanstack/react-query";
import { getBalances } from "lib/utils";
import { useQueryKeys } from "./useQueryKeys";
import { useTokensList } from "./useTokenList";

export const useTokenListBalances = () => {
  const web3 = useWeb3();
  const account = useAccount();
  const list = useTokensList().data;
  const queryKey = useQueryKeys().balances;
  const invalidChain = useIsInvalidChain()
  return useQuery({
    queryKey,
    queryFn: async () => getBalances(list!, web3, account),
    enabled: !!web3 && !!list && !!account && !invalidChain,
    refetchInterval: 30_000,
    staleTime: Infinity,
  });
};
