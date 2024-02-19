import { zeroAddress } from "@defi.org/web3-candies";
import { amountUi, useChainConfig } from "@orbs-network/liquidity-hub-ui";
import { useMemo } from "react";
import { useGasPrice } from "./useGasPrice";
import { usePriceUsd } from "./usePriceUsd";

export const useTransactionEstimateGas = () => {
  const { data: gasPrice } = useGasPrice();
  const nativeTokenPrice = usePriceUsd({ address: zeroAddress }).data;

  const nativeTokenDecimals = useChainConfig()?.native.decimals;

  const price = gasPrice?.med.max;

  return useMemo(() => {
    if (!price || !nativeTokenPrice) return "0";
    const value = amountUi(nativeTokenDecimals, price.multipliedBy(750_000));
    return nativeTokenPrice * Number(value);
  }, [price, nativeTokenDecimals, nativeTokenPrice]);
};
