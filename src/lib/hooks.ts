/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSwapStore } from "./store";
import BN from "bignumber.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  zeroAddress,
  isNativeAddress,
  erc20abi,
  estimateGasPrice,
  eqIgnoreCase,
  switchMetaMaskNetwork,
} from "@defi.org/web3-candies";
import { useLiquidityHub } from "@orbs-network/liquidity-hub-lib";
import { DEFAULT_SLIPPAGE, QUERY_KEYS } from "./consts";
import { amountUi, fetchPrice, tokensWithBalances } from "./util";
import Web3 from "web3";
import _ from "lodash";
import { useWidgetContext } from "lib/context";
import { getChainConfig } from "lib/chains";

export const useToAmount = () => {
  const { quote } = useLiquidityHubWithArgs();
  const toAmount = useSwapStore((s) => s.toAmount);
  return useMemo(() => {
    return {
      rawAmount: quote?.outAmount,
      uiAmount: quote?.outAmountUI,
    };
  }, [quote, toAmount]);
};

export const useGetTokensQuery = () => {
  const { address, connectedChainId } = useWidgetContext();
  const wrongChain = useIsWrongChain();
  const web3 = useWeb3();
  const { updateStore, fromTokenAddress } = useSwapStore((s) => ({
    updateStore: s.updateStore,
    fromTokenAddress: s.fromTokenAddress,
  }));
  const chainConfig = getChainConfig(connectedChainId!);

  return useQuery({
    queryFn: async () => {
      let tokens = await chainConfig!.getTokens();
      tokens = await tokensWithBalances(tokens, web3, address);

      let sorted = _.orderBy(
        tokens,
        (t) => {
          return new BN(t.balance || "0");
        },
        ["desc"]
      );

      console.log({ sorted });
      
      const isValidFromToken = _.find(sorted, (t) =>
        eqIgnoreCase(t.address, fromTokenAddress || "")
      );
      if (!isValidFromToken) {
        updateStore({ fromTokenAddress: sorted[1].address });
      }
      const nativeTokenIndex = _.findIndex(tokens, (t) =>
        eqIgnoreCase(t.address, zeroAddress)
      );

      const nativeToken = tokens[nativeTokenIndex];
      sorted = sorted.filter((t) => !eqIgnoreCase(t.address, zeroAddress));
      sorted.unshift(nativeToken);

      return sorted;
    },
    queryKey: [QUERY_KEYS.GET_TOKENS, connectedChainId, address, web3?.version],
    enabled: !!chainConfig && !!connectedChainId && !wrongChain,
    refetchInterval: 60_000,
    staleTime: Infinity,
  });
};

export const useUSDPriceQuery = (address?: string, disabled?: boolean) => {
  const { connectedChainId: chainId, getUsdPrice } = useWidgetContext();

  return useQuery({
    queryFn: async () => {
      const wTokenAddress = getChainConfig(chainId!)?.wToken?.address;
      if (!chainId || !address || !wTokenAddress) return 0;

      const _address = isNativeAddress(address) ? wTokenAddress : address;

      if (getUsdPrice) {
        return getUsdPrice(_address, chainId);
      }
      return fetchPrice(_address, chainId);
    },
    queryKey: [QUERY_KEYS.USD_PRICE, chainId, address],
    refetchInterval: 10_000,
    staleTime: Infinity,
    retry: 1,
    enabled: !disabled,
  });
};

export const useTokenAmountUSD = (
  address?: string,
  amount?: string,
  disabled?: boolean
) => {
  const { data: usd } = useUSDPriceQuery(address, disabled);

  return useMemo(() => {
    if (!amount || !usd) return "";
    return BN(amount).multipliedBy(usd).toString();
  }, [amount, usd]);
};

export const useTokenContract = (address?: string) => {
  const web3 = useWeb3();

  return useMemo(() => {
    if (!address || !web3 || !address.startsWith("0x")) return undefined;
    return new web3.eth.Contract(erc20abi, address);
  }, [web3, address]);
};

export const useSwitchNetwork = () => {
  return useMutation({
    mutationFn: async (chainId: number) => switchMetaMaskNetwork(chainId),
  });
};

export const useSubmitButton = () => {
  const { updateStore, fromAmount } = useSwapStore((s) => ({
    fromAmount: s.fromAmount,
    updateStore: s.updateStore,
  }));
  const {
    confirmSwap,
    swapLoading,
    quote,
    quoteLoading,
    quoteError,
    analytics: { initSwap },
  } = useLiquidityHubWithArgs();
  const toAmount = useToAmount();
  const refetchBalances = useRefetchBalancesCallback();

  const swap = useCallback(async () => {
    initSwap();

    confirmSwap({
      onSuccess: () => {
        refetchBalances();
        updateStore({
          fromAmount: "",
        });
      },
    });
  }, [confirmSwap, refetchBalances, updateStore, initSwap]);

  const { onConnect, address, partnerChainId } = useWidgetContext();
  const { mutate: switchNetwork, isLoading: switchNetworkLoading } =
    useSwitchNetwork();
  const wrongChain = useIsWrongChain();
  const outAmount = quote?.outAmount;
  const fromToken = useFromToken();
  const toToken = useToToken();

  if (!address) {
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

  if (BN(fromAmount || 0).isZero() && BN(toAmount?.rawAmount || 0).isZero()) {
    return {
      disabled: true,
      text: "Enter an amount",
    };
  }

  if (quoteLoading) {
    return {
      disabled: false,
      text: "",
      isLoading: true,
    };
  }

  const fromAmountBN = new BN(fromAmount || "0");
  const fromTokenBalanceBN = new BN(fromToken.balance || "0");
  if (fromAmountBN.gt(fromTokenBalanceBN)) {
    return {
      disabled: true,
      text: "Insufficient balance",
    };
  }

  if (quoteError || BN(outAmount || "0").isZero()) {
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
    onClick: swap,
    isLoading: swapLoading,
  };
};

export const useFromToken = () => {
  const { fromTokenAddress } = useSwapStore((s) => ({
    fromTokenAddress: s.fromTokenAddress,
  }));

  return useTokenFromTokenList(fromTokenAddress);
};

export const useToToken = () => {
  const { toToken } = useSwapStore((s) => ({
    toToken: s.toTokenAddress,
  }));

  return useTokenFromTokenList(toToken);
};

export const useLiquidityHubWithArgs = () => {
  const fromAmount = useSwapStore((s) => s.fromAmount);
  const fromToken = useFromToken();
  const toToken = useToToken();
  const fromTokenUsd = useUSDPriceQuery(fromToken?.address).data;
  const toTokenUsd = useUSDPriceQuery(toToken?.address).data;
  const { slippage } = useWidgetContext();

  return useLiquidityHub({
    fromToken,
    toToken,
    fromAmountUI: fromAmount,
    toTokenUsd,
    fromTokenUsd,
    slippage: slippage || DEFAULT_SLIPPAGE,
  });
};

export const useRefetchBalancesCallback = () => {
  const updateStore = useSwapStore((s) => s.updateStore);
  const { refetch } = useGetTokensQuery();

  return useCallback(async () => {
    try {
      updateStore({
        fetchingBalancesAfterTx: true,
      });
      await refetch();
    } catch (error) {
      console.error("Failed to refetch balances after tx", error);
    } finally {
      updateStore({
        fetchingBalancesAfterTx: false,
      });
    }
  }, [updateStore]);
};

export function useDebounce(value: string, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}
export const useWeb3 = () => {
  const { provider } = useWidgetContext();
  return useMemo(() => {
    if (provider) return new Web3(provider);
  }, [provider]);
};

export const useGasPriceQuery = () => {
  const chainId = useWidgetContext().connectedChainId;
  const web3 = useWeb3();
  return useQuery({
    queryKey: [QUERY_KEYS.GAS_PRICE, chainId],
    queryFn: () => {
      return estimateGasPrice(undefined, undefined, web3);
    },
    refetchInterval: 15_000,
    enabled: !!web3,
  });
};

export const useTxEstimateGasPrice = () => {
  const { data: gasPrice } = useGasPriceQuery();
  const nativeTokenPrice = useUSDPriceQuery(zeroAddress).data;

  const nativeTokenDecimals = useChainConfig()?.native.decimals;

  const price = gasPrice?.med.max;

  return useMemo(() => {
    if (!price || !nativeTokenPrice) return "0";
    const value = amountUi(nativeTokenDecimals, price.multipliedBy(750_000));
    return nativeTokenPrice * Number(value);
  }, [price, nativeTokenDecimals, nativeTokenPrice]);
};

export const useTokenFromTokenList = (address?: string) => {
  const { data: tokens, dataUpdatedAt } = useGetTokensQuery();
  return useMemo(() => {
    if (!address || !tokens) return undefined;
    console.log({ address });
    
    return tokens.find((t) => eqIgnoreCase(t?.address || '', address));
  }, [address, dataUpdatedAt]);
};

export const useOnPercentClickCallback = () => {
  const updateStore = useSwapStore((s) => s.updateStore);
  const fromTokenBalance = useFromToken()?.balance;

  return useCallback(
    (percent: number) => {
      updateStore({
        fromAmount: new BN(fromTokenBalance || "0")
          .multipliedBy(percent)
          .toString(),
      });
    },
    [updateStore, fromTokenBalance]
  );
};

export const useChainConfig = () => {
  const { partnerChainId } = useWidgetContext();
  return useMemo(() => {
    return getChainConfig(partnerChainId);
  }, [partnerChainId]);
};

export const useIsWrongChain = () => {
  const { connectedChainId, partnerChainId } = useWidgetContext();
  return useMemo(() => {
    return connectedChainId !== partnerChainId;
  }, [connectedChainId, partnerChainId]);
};

export function useIsInViewport(ref: any) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIsIntersecting(entry.isIntersecting)
      ),
    []
  );

  useEffect(() => {
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, observer]);

  return isIntersecting;
}
