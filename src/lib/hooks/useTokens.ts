import { useQuery } from "@tanstack/react-query";
import { tokensWithBalances } from "lib/utils";
import BN from "bignumber.js";
import _ from "lodash";
import {
  eqIgnoreCase,
  erc20s,
  networks,
  zeroAddress,
} from "@defi.org/web3-candies";
import {
  Token,
  useChainId,
  useAccount,
  useWeb3,
} from "@orbs-network/liquidity-hub-ui";
import {useMemo } from "react";
import axios from "axios";

const getPolygonTokens = async (): Promise<Token[]> => {
  const res = await (
    await axios.get(
      "https://unpkg.com/quickswap-default-token-list@1.3.16/build/quickswap-default.tokenlist.json"
    )
  ).data;
  const tokens = res.tokens.filter((it: any) => it.chainId === 137);

  const candiesAddresses = [
    zeroAddress,
    ..._.map(erc20s.poly, (t) => t().address),
  ];
  const sorted = _.sortBy(tokens, (t: any) => {
    const index = candiesAddresses.indexOf(t.address);
    return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
  });

  return [networks.poly.native, ...sorted].map((token: any) => {
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      logoUrl:
        token.logoUrl || token.logoURI?.replace("/logo_24.png", "/logo_48.png"),
      name: token.name,
    };
  });
};

const getBNBTokens = async (): Promise<Token[]> => {
  let tokens = await (
    await axios.get(
      "https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/bsc.json"
    )
  ).data;
  const candiesAddresses = [
    zeroAddress,
    ..._.map(erc20s.bsc, (t) => t().address),
  ];
  tokens = _.sortBy(tokens, (t: any) => {
    const index = candiesAddresses.indexOf(t.address);
    return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
  });

  const filteredTokens = tokens.filter((it: any) => it.chainId === 56);
  return filteredTokens.map((it: any) => {
    return {
      address: it.address,
      symbol: it.symbol,
      decimals: it.decimals,
      logoUrl: it.logoURI?.replace("_1", ""),
    };
  });
};

const getPolygonZkEvmTokens = async (): Promise<Token[]> => {
  let tokens = await (
    await axios.get(
      "https://unpkg.com/quickswap-default-token-list@1.3.21/build/quickswap-default.tokenlist.json"
    )
  ).data.tokens;

  const native = {
    ...networks.eth.wToken,
    address: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
  };

  const res = tokens
    .filter((it: any) => it.chainId === 1101)
    .map((it: any) => {
      return {
        address: it.address,
        symbol: it.symbol,
        decimals: it.decimals,
        logoUrl: it.logoURI,
      };
    });
  return [native, ...res];
};

const getBaseTokens = async (): Promise<Token[]> => {
  let tokens = await (
    await axios.get(
      "https://raw.githubusercontent.com/ethereum-optimism/ethereum-optimism.github.io/master/optimism.tokenlist.json"
    )
  ).data.tokens;

  const res = tokens
    .filter((token: any) => token.chainId === 8453)
    .map((it: any): Token => {
      return {
        address: it.address,
        decimals: it.decimals,
        symbol: it.symbol,
        logoUrl: it.logoURI,
      };
    });
  return [networks.base.native, ...res];
};

const chainTokens = {
  137: getPolygonTokens,
  56: getBNBTokens,
  1101: getPolygonZkEvmTokens,
  8453: getBaseTokens,
};

const useGetTokensFN = (chainId?: number) => {

  return useMemo(
    () =>
      !chainId ? undefined : chainTokens[chainId as keyof typeof chainTokens],
    [chainId]
  );
};

const useTokensList = () => {
  const chainId = useChainId();
  const account = useAccount();
  const web3 = useWeb3();
  const getTokens = useGetTokensFN(chainId);

  return useQuery({
    queryFn: async () => {
      if (account && !web3) return [];
      return getTokens?.() || [];
    },
    queryKey: ["GET_TOKENS", chainId, account, web3?.version],
    staleTime: Infinity,
    enabled: !!getTokens,
  });
};

export const useBalances = () => {
  const { data: list } = useTokensList();
  const chainId = useChainId();
  const account = useAccount();
  const web3 = useWeb3();
  return useQuery({
    queryKey: ["BALANCES", chainId, account],
    queryFn: async () => {
      const res = await tokensWithBalances(list!, web3, account);
      return _.mapValues(_.keyBy(res, "address"), "balance");
    },
    enabled: !!list && !!web3 && !!account && chainId !== undefined,
    refetchInterval: 60_000,
    staleTime: Infinity,
  });
};

export const useSortedTokens = () => {
  const {
    data: list,
    isLoading,
    dataUpdatedAt: listUpdatedAt,
  } = useTokensList();
  const { data: balances, dataUpdatedAt: balancesUpdatedAt } = useBalances();

  const tokens = useMemo(() => {
    if (!list) return [];

    let sorted = _.orderBy(
      list,
      (t) => {
        return new BN(balances?.[t.address] || "0");
      },
      ["desc"]
    );

    const nativeTokenIndex = _.findIndex(sorted, (t) =>
      eqIgnoreCase(t.address, zeroAddress)
    );

    const nativeToken = sorted[nativeTokenIndex];
    sorted = sorted.filter((t) => !eqIgnoreCase(t.address, zeroAddress));
    sorted.unshift(nativeToken);

    return sorted;
  }, [listUpdatedAt, balancesUpdatedAt]);

  return {
    sortedTokens: tokens,
    isLoading,
    dateUpdatedAt: balancesUpdatedAt,
  };
};

export const useTokenBalance = (address?: string) => {
  const { data: balances } = useBalances();
  return !address ? "0" : balances?.[address] || "0";
};
