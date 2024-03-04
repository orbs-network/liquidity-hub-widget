import { useQuery } from "@tanstack/react-query";
import { fetchPrice } from "lib/utils";
import { isNativeAddress, useChainConfig, useIsInvalidChain } from "@orbs-network/liquidity-hub-ui";
import { QUERY_KEYS } from "lib/consts";
import { useMainContext } from "lib/context";

export const usePriceUsd = ({
  address,
  refetchInterval = 30_000,
  noRefetch,
}: {
  address?: string;
  refetchInterval?: number;
  noRefetch?: boolean;
}) => {
  const chainConfig = useChainConfig();
  const chainId = chainConfig?.chainId;
  const wTokenAddress = chainConfig?.wToken?.address;
  const invalidChain = useIsInvalidChain()
  const {getUsdPrice} = useMainContext()
  return useQuery({
    queryFn: async () => {
      if (
        !chainId ||
        !address ||
        !wTokenAddress ||
        !chainConfig ||
        invalidChain
      )
        return 0;

      const _address = isNativeAddress(address) ? wTokenAddress : address;

      if (getUsdPrice) {
        return getUsdPrice(_address, chainId);
      }
      return fetchPrice(_address, chainId);
    },
    queryKey: [QUERY_KEYS.USD_PRICE, chainId, address],
    refetchInterval: noRefetch ? false : refetchInterval,
    staleTime: Infinity,
    retry: 2,
  });
};
