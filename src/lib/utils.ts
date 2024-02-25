import axios from "axios";
import BN from "bignumber.js";
import { isNativeAddress, erc20abi } from "@defi.org/web3-candies";
import Web3 from "web3";
import { ContractCallContext, Multicall } from "ethereum-multicall";
import _ from "lodash";
import { amountUi, Token } from "@orbs-network/liquidity-hub-ui";
import { Balances } from "./type";

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
    return parseFloat(data.pairs[0].priceUsd);
  } catch (e) {
    throw new Error(`fetchPrice: ${tokenAddress} failed`);
  }
}

export const getBalances = async (
  tokens: Token[],
  web3?: Web3,
  account?: string
): Promise<Balances> => {
  if (!web3 || !account) {
    return {};
  }
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

  const [nativeBalance, results] = await Promise.all([
    web3.eth.getBalance(account),
    multicall.call(contractCallContext),
  ]);

  const balances: { [key: string]: string } = {};

  if (native) {
    balances[native.address] = amountUi(native.decimals, new BN(nativeBalance));
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

  const res = tokens.map((token) => {
    return {
      address: token.address,
      balance: balances[token.address] || "0",
    };
  });

  return _.mapValues(_.keyBy(res, "address"), "balance");
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
