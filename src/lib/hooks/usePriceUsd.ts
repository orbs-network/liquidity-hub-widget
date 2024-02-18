import { isNativeAddress } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "lib/config/consts";
import { fetchPrice } from "lib/util";
import { useChainConfig } from "./useChainConfig";

export const usePriceUsd = ({
  address,
  disabled,
  getPrice,
  refetchInterval = 30_000,
  noRefetch
}: {
  address?: string;
  disabled?: boolean;
  getPrice?: (address: string, chainId: number) => Promise<number>;
  refetchInterval?: number;
    noRefetch?: boolean;
}) => {
  const chainConfig = useChainConfig();
  const chainId = chainConfig?.chainId;
  const wTokenAddress = chainConfig?.wToken?.address;
  return useQuery({
    queryFn: async () => {
      if (!chainId || !address || !wTokenAddress) return 0;

      const _address = isNativeAddress(address) ? wTokenAddress : address;

      if (getPrice) {
        return getPrice(_address, chainId);
      }
      return fetchPrice(_address, chainId);
    },
    queryKey: [QUERY_KEYS.USD_PRICE, chainId, address],
    refetchInterval: noRefetch ? false :  refetchInterval,
    staleTime: Infinity,
    retry: 1,
    enabled: !disabled && !!chainConfig && !!address,
  });
};
