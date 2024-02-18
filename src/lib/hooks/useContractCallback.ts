import { erc20abi, isNativeAddress } from "@defi.org/web3-candies";
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { useChainConfig } from "./useChainConfig";

export const useContractCallback = () => {
  const { web3 } = useMainContext();
  const wethAddress = useChainConfig()?.wToken?.address;

  return useCallback(
    (address?: string) => {
      if (!address || !web3 || !address.startsWith('0x')) return undefined;
      const _address = isNativeAddress(address) ? wethAddress : address;
      return _address ? new web3.eth.Contract(erc20abi, address) : undefined;
    },
    [web3, wethAddress]
  );
};
