import { estimateGasPrice } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "lib/config/consts";
import { useMainContext } from "lib/provider";

export const useGasPrice = () => {
  const {chainId, web3} = useMainContext();
  return useQuery({
    queryKey: [QUERY_KEYS.GAS_PRICE, chainId],
    queryFn: () => {
      return estimateGasPrice(undefined, undefined, web3);
    },
    refetchInterval: 15_000,
    enabled: !!web3,
  });
};
