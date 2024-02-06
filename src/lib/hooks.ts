/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSwapStore } from "./store";
import BN from "bignumber.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Token } from "./type";
import {
  zeroAddress,
  isNativeAddress,
  erc20abi,
  estimateGasPrice,
  eqIgnoreCase,
  switchMetaMaskNetwork,
} from "@defi.org/web3-candies";
import {
  useLiquidityHub,
  Token as LHToken,
} from "@orbs-network/liquidity-hub-lib";
import { DEFAULT_SLIPPAGE, QUERY_KEYS } from "./consts";
import { amountUi, fetchPrice, tokensWithBalances } from "./util";
import Web3 from "web3";
import _ from "lodash";
import { useWidgetContext } from "lib/context";
import { getChainConfig } from "lib/chains";

export const useToAmount = () => {
  const { quote } = useLiquidityHubWithArgs();
  const { toToken } = useSwapStore();
  return useMemo(() => {
    if (!toToken) return;
    return {
      rawAmount: quote?.outAmount,
      uiAmount: amountUi(toToken.decimals, new BN(quote?.outAmount || "")),
    };
  }, [toToken, quote?.outAmount]);
};

const useTokensQueryKey = () => {
  const { address, chainId } = useWidgetContext();
  const web3 = useWeb3();
  return [QUERY_KEYS.GET_TOKENS, chainId, address, web3?.version];
};
export const useGetTokensQuery = () => {
  const { updateStore, fromToken, toToken } = useSwapStore();
  const { address, chainId } = useWidgetContext();
  const web3 = useWeb3();
  const queryKey = useTokensQueryKey();
  const chainConfig = getChainConfig(chainId!);

  return useQuery({
    queryFn: async () => {
      if (address && !web3) return [];
      let tokens = await chainConfig!.getTokens();

      if (address && web3) {
        tokens = await tokensWithBalances(web3, address, tokens);
      }

      let sorted = _.orderBy(
        tokens,
        (t) => {
          return new BN(t.balance || "0");
        },
        ["desc"]
      );

      const nativeTokenIndex = _.findIndex(tokens, (t) =>
        eqIgnoreCase(t.address, zeroAddress)
      );

      const nativeToken = tokens[nativeTokenIndex];
      sorted = sorted.filter((t) => !eqIgnoreCase(t.address, zeroAddress));
      sorted.unshift(nativeToken);

      if (!fromToken) {
        updateStore({ fromToken: sorted[1] });
      }

      if (!toToken) {
        updateStore({ toToken: sorted[2] });
      }

      return sorted;
    },
    queryKey,
    enabled: !!chainConfig && !!chainId,
    refetchInterval: 60_000,
  });
};

export const useUSDPriceQuery = (address?: string) => {
  const chainId = useWidgetContext().chainId;

  return useQuery({
    queryFn: async () => {
      const wTokenAddress = getChainConfig(chainId!)?.wToken?.address;
      if (!chainId || !address || !wTokenAddress) return 0;

      return fetchPrice(
        isNativeAddress(address) ? wTokenAddress : address,
        chainId
      );
    },
    queryKey: [QUERY_KEYS.USD_PRICE, chainId, address],
    refetchInterval: 10_000,
    staleTime: Infinity,
  });
};

export const useTokenAmountUSD = (token?: Token, amount?: string) => {
  const { data: usd } = useUSDPriceQuery(token?.address);

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

const useIsValidChain = () => {
  const { chainId, supportedChain } = useWidgetContext();

  return chainId === supportedChain;
};

export const useSwitchNetwork = () => {
  return useMutation({
    mutationFn: async (chainId: number) => switchMetaMaskNetwork(chainId),
  });
};

export const useSubmitButton = () => {
  const { fromAmount, fromToken, toToken, updateStore } = useSwapStore();
  const {
    confirmSwap,
    swapLoading,
    quote,
    quoteLoading,
    quoteError,
    analytics: { initSwap },
  } = useLiquidityHubWithArgs();

  const refetchBalances = useRefetchBalancesCallback();

  const swap = useCallback(async () => {
    initSwap();
    const onSuccess = () => {
      refetchBalances();

      updateStore({
        fromAmount: "",
      });
    };

    confirmSwap(onSuccess);
  }, [confirmSwap, refetchBalances, updateStore, initSwap]);

  const { onConnect, address, supportedChain } = useWidgetContext();
  const { mutate: switchNetwork, isLoading: switchNetworkLoading } =
    useSwitchNetwork();
  const isValidChain = useIsValidChain();
  const outAmount = quote?.outAmount;
  const fromTokenBalance = useTokenFromTokenList(fromToken)?.balance;

  if (!address) {
    return {
      disabled: false,
      text: "Connect Wallet",
      onClick: onConnect,
    };
  }

  if (!isValidChain) {
    return {
      disabled: false,
      text: `Switch to ${getChainConfig(supportedChain)?.chainName}`,
      onClick: () => switchNetwork?.(supportedChain!),
      isLoading: switchNetworkLoading,
    };
  }

  if (!fromToken || !toToken) {
    return {
      disabled: true,
      text: "Select tokens",
    };
  }

  if (!fromAmount || BN(fromAmount).isZero()) {
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
  const fromTokenBalanceBN = new BN(fromTokenBalance || "0");
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

const useParseTokensForLh = () => {
  const { fromToken, toToken } = useSwapStore((s) => ({
    fromToken: s.fromToken,
    toToken: s.toToken,
  }));

  return useMemo((): { fromToken: LHToken; toToken: LHToken } | undefined => {
    if (!fromToken || !toToken) return undefined;

    return {
      fromToken: {
        address: fromToken?.address,
        symbol: fromToken?.symbol,
        decimals: fromToken?.decimals,
        logoUrl: fromToken?.logoUrl,
      },
      toToken: {
        address: toToken?.address,
        symbol: toToken?.symbol,
        decimals: toToken?.decimals,
        logoUrl: toToken?.logoUrl,
      },
    };
  }, [fromToken, toToken]);
};

export const useLiquidityHubWithArgs = () => {
  const { fromAmount, fromToken, toToken } = useSwapStore();
  const fromTokenUsd = useUSDPriceQuery(fromToken?.address).data;
  const toTokenUsd = useUSDPriceQuery(toToken?.address).data;
  const parsedTokens = useParseTokensForLh();
  const {slippage} = useWidgetContext();
  return useLiquidityHub({
    fromToken: parsedTokens?.fromToken,
    toToken: parsedTokens?.toToken,
    fromAmountUI: fromAmount,
    dexAmountOut: "",
    toTokenUsd,
    fromTokenUsd,
    slippage: slippage || DEFAULT_SLIPPAGE,
  });
};

export const useRefetchBalancesCallback = () => {
  const client = useQueryClient();
  const web3 = useWeb3();
  const { chainId, address } = useWidgetContext();
  const { fromToken, toToken, updateStore } = useSwapStore((s) => ({
    fromToken: s.fromToken,
    toToken: s.toToken,
    updateStore: s.updateStore,
  }));
  const queryKey = useTokensQueryKey();

  return useCallback(async () => {
    if (!address || !fromToken || !toToken || !web3 || !chainId) return;
    updateStore({
      fetchingBalancesAfterTx: true,
    });
    const [updatedFromToken, updateToToken] = await tokensWithBalances(
      web3,
      address,
      [fromToken, toToken]
    );

    client.setQueryData(queryKey, (old?: Token[]) => {
      if (!old) return old;
      return old.map((t: Token) => {
        if (eqIgnoreCase(t.address, updatedFromToken.address))
          return updatedFromToken;
        if (eqIgnoreCase(t.address, updateToToken.address))
          return updateToToken;
        return t;
      });
    });
    updateStore({
      fetchingBalancesAfterTx: false,
    });
  }, [
    address,
    fromToken,
    toToken,
    web3,
    updateStore,
    client,
    queryKey,
    chainId,
  ]);
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
  const chainId = useWidgetContext().chainId;
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

export const useTokenFromTokenList = (token?: Token) => {
  const { data: tokens, dataUpdatedAt } = useGetTokensQuery();
  return useMemo(() => {
    if (!token || !tokens) return undefined;
    return tokens.find((t) => eqIgnoreCase(t.address, token.address));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, dataUpdatedAt]);
};

export const useOnPercentClickCallback = () => {
  const { fromToken, updateStore } = useSwapStore((s) => ({
    fromToken: s.fromToken,
    updateStore: s.updateStore,
  }));
  const fromTokenBalance = useTokenFromTokenList(fromToken)?.balance;

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
  const { chainId } = useWidgetContext();
  return useMemo(() => {
    return getChainConfig(chainId);
  }, [chainId]);
};


