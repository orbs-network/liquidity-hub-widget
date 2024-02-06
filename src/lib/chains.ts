import { erc20s, networks, zeroAddress } from "@defi.org/web3-candies";
import axios from "axios";
import _ from "lodash";
import { Token } from "lib/type";

enum Chains {
  POLYGON = 137,
  BSC = 56,
}

export interface Network {
  native: Token;
  getTokens: () => Promise<Token[]>;
  wToken?: Token;
  chainId: Chains;
  chainName: string;
}

class Polygon implements Network {
  native = networks.poly.native;
  wToken = networks.poly.wToken;
  chainId = Chains.POLYGON;
  chainName = "Polygon";
  getTokens = async (): Promise<Token[]> => {
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
          token.logoUrl ||
          token.logoURI?.replace("/logo_24.png", "/logo_48.png"),
        name: token.name,
      };
    });
  };
}

class Bsc implements Network {
  native = networks.bsc.native;
  wToken = networks.bsc.wToken;
  chainId = Chains.BSC;
  chainName = "BSC";
  getTokens = async (): Promise<Token[]> => {
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
}

const ChainsConfig: { [key: number]: Network } = {
  [Chains.POLYGON]: new Polygon(),
  [Chains.BSC]: new Bsc(),
};

export const getChainConfig = (chainId?: number): Network | undefined => {
  if (!chainId) return undefined;
  return ChainsConfig[chainId];
};
