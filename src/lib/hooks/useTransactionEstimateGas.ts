import { zeroAddress } from "@defi.org/web3-candies";
import { amountUi, useChainConfig } from "@orbs-network/liquidity-hub-lib";
import { useMemo } from "react";
import { useGasPriceQuery } from "./useGasPrice";
import { usePriceUsd } from "./usePriceUsd";

export const useTransactionEstimateGas = () => {
  const { data: gasPrice } = useGasPriceQuery();
  const nativeTokenPrice = usePriceUsd(zeroAddress).data;

  const nativeTokenDecimals = useChainConfig()?.native.decimals;

  const price = gasPrice?.med.max;

  return useMemo(() => {
    if (!price || !nativeTokenPrice) return "0";
    const value = amountUi(nativeTokenDecimals, price.multipliedBy(750_000));
    return nativeTokenPrice * Number(value);
  }, [price, nativeTokenDecimals, nativeTokenPrice]);
};
