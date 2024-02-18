import { useMemo } from "react";
import { usePriceUsd } from "./usePriceUsd";
import BN from "bignumber.js";

export const useUsdAmount = (
  address?: string,
  amount?: string,
  disabled?: boolean
) => {
  const { data: usd } = usePriceUsd(address, disabled);

  return useMemo(() => {
    if (!amount || !usd) return "";
    return BN(amount).multipliedBy(usd).toString();
  }, [amount, usd]);
};
