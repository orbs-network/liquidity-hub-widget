import { erc20s, networks, zeroAddress } from "@defi.org/web3-candies";
import axios from "axios";
import _ from "lodash";
import { Network, Token } from "lib/type";


class Polygon implements Network {
  native = networks.poly.native;
  wToken = networks.poly.wToken;
  chainId = 137;
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
  chainId = 56;
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

class ZkEvm implements Network {
  native = networks.eth.native;
  wToken = {
    ...networks.eth.wToken,
    address: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
  };
  chainId = 1101;
  chainName = "Polygon ZkEVM";
  getTokens = async (): Promise<Token[]> => {
    let tokens = await(
      await axios.get(
        "https://unpkg.com/quickswap-default-token-list@1.3.21/build/quickswap-default.tokenlist.json"
      )
    ).data.tokens;
  
    const res =  tokens.filter((it: any) => it.chainId === this.chainId).map((it: any) => {
      return {
        address: it.address,
        symbol: it.symbol,
        decimals: it.decimals,
        logoUrl: it.logoURI,
      };
    });
    return [this.native, ...res]
  };
}


export const supportedChainsConfig = {
  polygon: new Polygon(),
  bsc: new Bsc(),
  skevm: new ZkEvm(),
};

export const getChainConfig = (chainId?: number): Network | undefined => {
  if (!chainId) return undefined;
  return Object.values(supportedChainsConfig).find(
    (it) => it.chainId === chainId
  );
};
