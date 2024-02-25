import { useFormatNumber } from "@orbs-network/liquidity-hub-ui";
import { useMainStore } from "lib/store";
import { useTokenListBalance } from "../useTokenListBalance";

export function useFromTokenPanel() {
  const { token, amount, onTokenSelect, onChange } = useMainStore((s) => ({
    token: s.fromToken,
    amount: s.fromAmount,
    onTokenSelect: s.onFromTokenChange,
    onChange: s.onFromAmountChange,
  }));

  const balance = useFormatNumber({
    value: useTokenListBalance(token?.address),
  });


  return {
    token,
    amount,
    balance,
    onTokenSelect,
    onChange,
  };
}
