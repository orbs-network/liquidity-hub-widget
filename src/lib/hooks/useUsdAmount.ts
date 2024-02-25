import { useMemo } from "react";
import { usePriceUsd } from "./usePriceUsd";
import BN from "bignumber.js";

export const useUsdAmount = ({
  address,
  amount,
  disabled,
}: {
  address?: string;
  amount?: string;
  disabled?: boolean;
}) => {
  const { data: usd } = usePriceUsd({ address, disabled });

  return useMemo(() => {
    if (!amount || !usd) return undefined;
    return BN(amount).multipliedBy(usd).toString();
  }, [amount, usd]);
};
