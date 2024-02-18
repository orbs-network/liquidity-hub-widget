import { estimateGasPrice } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "lib/consts";
import { useSharedContext } from "lib/context";
import { useWeb3 } from "./useWeb3";

export const useGasPrice = () => {
  const chainId = useSharedContext().chainId;
  const web3 = useWeb3();
  return useQuery({
    queryKey: [QUERY_KEYS.GAS_PRICE, chainId],
    queryFn: () => {
      return estimateGasPrice(undefined, undefined, web3);
    },
    refetchInterval: 15_000,
    enabled: !!web3,
  });
};
