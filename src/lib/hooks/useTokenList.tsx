import { erc20s, networks, zeroAddress } from "@defi.org/web3-candies";
import { Token, useAccount, usePartnerChainId, useWeb3 } from "@orbs-network/liquidity-hub-ui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { QUERY_KEYS } from "lib/consts";
import _ from "lodash";
import { useMemo } from "react";

const getPolygonTokens = async (): Promise<Token[]> => {
  const res = await (
    await axios.get(
      "https://unpkg.com/quickswap-default-token-list@1.3.16/build/quickswap-default.tokenlist.json"
    )
  ).data;
  const tokens = res.tokens.filter((it: any) => it.chainId === 137);
        console.log('before candies');
        
  const candiesAddresses = [
    zeroAddress,
    ..._.map(erc20s.poly, (t) => t().address),
  ];
  console.log('candiesAddresses', candiesAddresses);
  
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


export const useTokensList = () => {
  const chainId = usePartnerChainId();
  const account = useAccount();
  const web3 = useWeb3();
  const getTokens = useGetTokensFN(chainId);   
   
  return useQuery({
    queryFn: async () => {
      if (account && !web3) return [];
      return getTokens?.() || [];
    },
    queryKey: [QUERY_KEYS.TOKENS_LIST, chainId, account, web3?.version],
    staleTime: Infinity,
    enabled: !!getTokens,
  });
};
