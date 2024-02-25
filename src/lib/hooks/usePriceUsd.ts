import { isNativeAddress } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { fetchPrice } from "lib/utils";
import { useChainConfig, useIsInvalidChain } from "@orbs-network/liquidity-hub-ui";
import { QUERY_KEYS } from "lib/consts";
import { GetPriceUSD } from "lib/type";

export const usePriceUsd = ({
  address,
  disabled,
  refetchInterval = 30_000,
  noRefetch,
  getPriceUsd,
}: {
  address?: string;
  disabled?: boolean;
  refetchInterval?: number;
  noRefetch?: boolean;
  getPriceUsd?: GetPriceUSD;
}) => {
  const chainConfig = useChainConfig();
  const chainId = chainConfig?.chainId;
  const wTokenAddress = chainConfig?.wToken?.address;
  const invalidChain = useIsInvalidChain()
  return useQuery({
    queryFn: async () => {
      if (!chainId || !address || !wTokenAddress) return 0;

      const _address = isNativeAddress(address) ? wTokenAddress : address;

      if (getPriceUsd) {
        return getPriceUsd(_address, chainId);
      }
      return fetchPrice(_address, chainId);
    },
    queryKey: [QUERY_KEYS.USD_PRICE, chainId, address],
    refetchInterval: noRefetch ? false : refetchInterval,
    staleTime: Infinity,
    retry: 1,
    enabled: !disabled && !!chainConfig && !!address && !invalidChain,
  });
};
