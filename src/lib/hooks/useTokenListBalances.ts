import {
  useAccount,
  useChainId,
  useIsInvalidChain,
  useWeb3,
} from "@orbs-network/liquidity-hub-ui";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "lib/consts";
import { getBalances } from "lib/utils";
import { useTokensList } from "./useTokenList";

export const useTokenListBalances = () => {
  const web3 = useWeb3();
  const account = useAccount();
  const list = useTokensList().data;
  const invalidChain = useIsInvalidChain();
  const chainId = useChainId()  

  return useQuery({
    queryKey: [QUERY_KEYS.BALANCES, account, chainId],
    queryFn: async () => getBalances(list!, web3, account),
    refetchInterval: 30_000,
    staleTime: Infinity,
    enabled: !!web3 && !!account && !!list && !invalidChain,
  });
};
