import { switchMetaMaskNetwork } from "@defi.org/web3-candies";
import { useMutation } from "@tanstack/react-query";

export const useSwitchNetwork = () => {
  return useMutation({
    mutationFn: async (chainId: number) => switchMetaMaskNetwork(chainId),
  });
};
