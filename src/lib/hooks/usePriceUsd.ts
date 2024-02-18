import { isNativeAddress } from "@defi.org/web3-candies";
import { useChainConfig } from "@orbs-network/liquidity-hub-lib";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "lib/consts";
import { useSharedContext } from "lib/context";
import { fetchPrice } from "lib/util";

export const usePriceUsd = (address?: string, disabled?: boolean) => {
  const { getUsdPrice } = useSharedContext();
  const chainConfig = useChainConfig();
  const chainId = chainConfig?.chainId;
  const wTokenAddress = chainConfig?.wToken?.address;
  return useQuery({
    queryFn: async () => {
      if (!chainId || !address || !wTokenAddress) return 0;

      const _address = isNativeAddress(address) ? wTokenAddress : address;

      if (getUsdPrice) {
        return getUsdPrice(_address, chainId);
      }
      return fetchPrice(_address, chainId);
    },
    queryKey: [QUERY_KEYS.USD_PRICE, chainId, address],
    refetchInterval: 10_000,
    staleTime: Infinity,
    retry: 1,
    enabled: !disabled && !!chainConfig && !!address,
  });
};
