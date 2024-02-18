import { getChainConfig, Token } from "lib";
import { useIsInvalidChain } from "./useIsInvalidChain";
import BN from "bignumber.js";
import { useSwitchNetwork } from "./useSwitchNetwork";
import { isNativeAddress } from "@defi.org/web3-candies";
import { useMainContext } from "lib/provider";
import { useTokenBalance } from "./useTokens";

export interface Props {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  toAmount?: string;
  onClick?: () => void;
  isLoading?: boolean;
  error?: boolean;
  onConnect?: () => void;
}

export const useShowConfirmation = ({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  onClick,
  isLoading,
  error,
  onConnect,
}: Props) => {
  
  const { account, partnerChainId } = useMainContext();
  const { mutate: switchNetwork, isPending: switchNetworkLoading } =
    useSwitchNetwork();
  const wrongChain = useIsInvalidChain();
  const fromAmountBN = new BN(fromAmount || "0");
  const fromTokenBalance = useTokenBalance(fromToken?.address);
  const fromTokenBalanceBN = new BN(fromTokenBalance);
    

  if (!account) {
    return {
      disabled: false,
      text: "Connect Wallet",
      onClick: onConnect,
    };
  }

  if (wrongChain) {
    return {
      disabled: false,
      text: `Switch to ${getChainConfig(partnerChainId)?.chainName}`,
      onClick: () => switchNetwork?.(partnerChainId!),
      isLoading: switchNetworkLoading,
    };
  }

  if (!fromToken || !toToken) {
    return {
      disabled: true,
      text: "Select tokens",
    };
  }

  if (BN(fromAmount || 0).isZero() && BN(toAmount || 0).isZero()) {
    return {
      disabled: true,
      text: "Enter an amount",
    };
  }

  if (isLoading) {
    return {
      disabled: false,
      text: "",
      isLoading: true,
    };
  }


  if (fromAmountBN.gt(fromTokenBalanceBN)) {
    return {
      disabled: true,
      text: "Insufficient balance",
    };
  }

  if (error || BN(toAmount || "0").isZero()) {
    return {
      disabled: true,
      text: "No liquidity",
    };
  }
  if (isNativeAddress(fromToken.address)) {
    return {
      disabled: false,
      text: "Wrap",
    };
  }
  return {
    disabled: false,
    text: "Swap",
    onClick,
    isLoading,
  };
};
