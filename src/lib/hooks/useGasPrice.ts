import { estimateGasPrice } from "@defi.org/web3-candies";
import { useChainId, useWeb3 } from "@orbs-network/liquidity-hub-ui";
import { useQuery } from "@tanstack/react-query";

export const useGasPrice = () => {
  const chainId = useChainId();
  const web3 = useWeb3();
  return useQuery({
    queryKey: ["useGasPrice", chainId],
    queryFn: () => {
      return estimateGasPrice(undefined, undefined, web3);
    },
    refetchInterval: 15_000,
    enabled: !!web3,
  });
};
