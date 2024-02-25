import { useMainStore } from 'lib/store';

export function useSwapTokens() {
  return  useMainStore((store) => store.onSwitchTokens);
}
