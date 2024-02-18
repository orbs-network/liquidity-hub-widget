import axios from "axios";
import BN, { BigNumber } from "bignumber.js";
import { parsebn } from "@defi.org/web3-candies";
import { isNativeAddress, erc20abi, zeroAddress } from "@defi.org/web3-candies";
import Web3 from "web3";
import { Network, Token } from "./type";
import {
  ContractCallContext,
  ContractCallResults,
  Multicall,
} from "ethereum-multicall";
import _ from "lodash";
import { supportedChainsConfig } from "./config/chains";
import { QUOTE_ERRORS } from "./config/consts";

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

export const amountBN = (decimals?: number, amount?: string) =>
  parsebn(amount || "").times(new BN(10).pow(decimals || 0));

export const amountUi = (decimals?: number, amount?: BN) => {
  if (!decimals || !amount) return "";
  const percision = new BN(10).pow(decimals || 0);
  return amount.times(percision).idiv(percision).div(percision).toString();
};

export const tokensWithBalances = async (
  tokens: Token[],
  web3?: Web3,
  account?: string,
 
): Promise<Token[]> => {

  if (!web3 || !account) {
    return tokens;
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


export const getChainConfig = (chainId?: number): Network | undefined => {
  if (!chainId) return undefined;
  return Object.values(supportedChainsConfig).find(
    (it) => it.chainId === chainId
  );
};


export async function waitForTxReceipt(web3: Web3, txHash: string) {
  for (let i = 0; i < 30; ++i) {
    // due to swap being fetch and not web3

    await delay(3_000); // to avoid potential rate limiting from public rpc
    try {
      const { mined, revertMessage } = await getTransactionDetails(
        web3,
        txHash
      );

      if (mined) {
        return {
          mined,
          revertMessage: undefined,
        };
      }
      if (revertMessage) {
        return {
          mined: false,
          revertMessage,
        };
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export async function getTransactionDetails(
  web3: Web3,
  txHash: string
): Promise<{ mined: boolean; revertMessage?: string }> {
  try {
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    if (!receipt) {
      return {
        mined: false,
      };
    }

    let revertMessage = "";

    if (!receipt.status) {
      // If the transaction was reverted, try to get the revert reason.
      try {
        const tx = await web3.eth.getTransaction(txHash);
        const code = await web3.eth.call(tx as any, tx.blockNumber!);
        revertMessage = web3.utils.toAscii(code).replace(/\0/g, ""); // Convert the result to a readable string
      } catch (err) {
        revertMessage = "Unable to retrieve revert reason";
      }
    }

    return {
      mined: receipt.status ? true : false,
      revertMessage,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch transaction details: ${error.message}`);
  }
}


export const deductSlippage = (amount?: string, slippage?: number) => {
  if (!amount) return "";
  if (!slippage) return amount;
  console.log(slippage, amount);

  return new BigNumber(amount)
    .times(100 - slippage)
    .div(100)
    .toString();
};


export const counter = () => {
  const now = Date.now();

  return () => {
    return Date.now() - now;
  };
};

export const addSlippage = (amount?: string, slippage?: number) => {
  if (!amount) return "";
  if (!slippage) return amount;
  return new BigNumber(amount)
    .times(100 + slippage)
    .div(100)
    .toString();
};
export const shouldReturnZeroOutAmount = (error: string) => {
  return error === QUOTE_ERRORS.tns;
};
