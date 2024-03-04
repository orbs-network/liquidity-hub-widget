import {
  amountBN,
  useUnwrap as _useUnwrap,
} from "@orbs-network/liquidity-hub-ui";
import { useMutation } from "@tanstack/react-query";
import { useMainStore } from "lib/store";
import { useShallow } from "zustand/react/shallow";
import { useTokenListBalances } from "./useTokenListBalances";

export const useUnwrap = () => {
  const { refetch } = useTokenListBalances();
  const { fromAmount, fromToken } = useMainStore(
    useShallow((s) => ({
      fromAmount: s.fromAmount,
      fromToken: s.fromToken,
    }))
  );

  const unwrap = _useUnwrap();
  return useMutation(
    async () => {
      return unwrap(amountBN(fromToken?.decimals, fromAmount).toString());
    },
    {
      onSuccess: () => {
        refetch();
      },
    }
  );
};
