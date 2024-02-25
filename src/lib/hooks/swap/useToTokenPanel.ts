import { useFormatNumber } from "@orbs-network/liquidity-hub-ui";
import { useMainStore } from "lib/store";
import { useTokenListBalance } from "../useTokenListBalance";
import { useLiquidityHubData } from "./useLiquidityHubData";

export function useToTokenPanel() {
  const { token, onTokenSelect } = useMainStore((s) => ({
    token: s.toToken,
    onTokenSelect: s.onToTokenChange,
  }));

  const amount = useLiquidityHubData().quote?.outAmountUI;

  const balance = useFormatNumber({
    value: useTokenListBalance(token?.address),
  });

  return {
    token,
    amount,
    balance,
    onTokenSelect,
  };
}
