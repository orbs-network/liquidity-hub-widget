import axios from "axios";
import BN from "bignumber.js";
import { parsebn } from "@defi.org/web3-candies";
import { isNativeAddress, erc20abi, zeroAddress } from "@defi.org/web3-candies";
import Web3 from "web3";
import { Token } from "./type";
import {
  ContractCallContext,
  ContractCallResults,
  Multicall,
} from "ethereum-multicall";
import _ from "lodash";

export async function fetchPriceParaswap(
  chainId: number,
  inToken: string,
  inTokenDecimals: number
) {
  const url = `https://apiv5.paraswap.io/prices/?srcToken=${inToken}&destToken=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c&amount=${BN(
    `1e${inTokenDecimals}`
  ).toString()}&srcDecimals=${inTokenDecimals}&destDecimals=18&side=SELL&network=${chainId}`;
  try {
    const res = await axios.get(url);
    return res.data.priceRoute.srcUSD;
  } catch (e) {
    console.log(e);
    return 0;
  }
}

export async function fetchPrice(
  tokenAddress: string,
  chainId: number
): Promise<number> {
  console.log("fetchPrice", tokenAddress, chainId);
  
  try {
    const { data } = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}/`
    );

    if (!data.pairs[0]) {
      const paraPrice = await fetchPriceParaswap(
        chainId,
        tokenAddress,
        data.decimals
      );
      return paraPrice.price;
    }
    console.log("fetchPrice", parseFloat(data.pairs[0].priceUsd));
    
    return parseFloat(data.pairs[0].priceUsd);
  } catch (e) {
    throw new Error(`fetchPrice: ${tokenAddress} failed`);
  }
}

export const amountBN = (decimals?: number, amount?: string) =>
  parsebn(amount || "").times(new BN(10).pow(decimals || 0));

export const amountUi = (decimals?: number, amount?: BN) => {
  if (!decimals || !amount) return "";
  const percision = new BN(10).pow(decimals || 0);
  return amount.times(percision).idiv(percision).div(percision).toString();
};

export const tokensWithBalances = async (
  web3: Web3,
  account: string,
  tokens: Token[]
): Promise<Token[]> => {
  const native = tokens.find((it) => isNativeAddress(it.address));
  const erc20Tokens = tokens.filter((it) => !isNativeAddress(it.address));

  const contractCallContext: ContractCallContext[] = erc20Tokens.map(
    (token) => {
      return {
        reference: token.address,
        contractAddress: token.address as string,
        abi: erc20abi as any,
        token,
        calls: [
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: [account],
          },
        ],
      };
    }
  );

  const multicall = new Multicall({ web3Instance: web3, tryAggregate: true });

  const results: ContractCallResults = await multicall.call(
    contractCallContext
  );

  const balances: { [key: string]: string } = {};

  if (native) {
    let nativeBalance = "0";
    try {
      nativeBalance = await web3.eth.getBalance(account);
    } catch (error) {
      console.log(error);
    }
    balances[zeroAddress] = amountUi(native.decimals, new BN(nativeBalance));
  }

  try {
    _.forEach(results.results, (value) => {
      if (!value) return "0";
      const result = value.callsReturnContext[0]?.returnValues[0]?.hex;
      if (!result) return "0";

      const token = (value.originalContractCallContext as any).token;

      balances[token.address] = amountUi(token.decimals, new BN(result));
    });
  } catch (error) {
    console.log(error);
  }
  return tokens.map((token) => {
    return {
      ...token,
      balance: balances[token.address] || "0",
    };
  });
};
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
