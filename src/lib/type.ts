/* eslint-disable @typescript-eslint/no-explicit-any */

import { CSSObject } from "styled-components";

export interface Network {
  native: Token;
  getTokens: () => Promise<Token[]>;
  wToken?: Token;
  chainId: number;
  chainName: string;
}


export interface TokenPanelProps {
  usd?: string | number;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  token?: Token;
  label?: string;
  isSrc?: boolean;
}

export interface Token {
  name?: string;
  address: string;
  decimals: number;
  symbol: string;
  logoUrl?: string;
}

export interface WidgetUISettings {
  theme?: {
    border?: {
      primary?: string;
      secondary?: string;
    };
    text?: {
      primary?: string;
      secondary?: string;
    };
  };
  styles?: {
    submitButton?: CSSObject;
    tokenPanel?: {
      container?: CSSObject;
      header?: CSSObject;
      input?: CSSObject;
      percentButtons?: CSSObject;
      tokenSelector?: CSSObject;
    };
    container?: CSSObject;
    switchTokens?: CSSObject;
  };
  layout?: {
    tokenPanel?: {
      headerOutside?: boolean;
      inputSide?: "left" | "right";
      usdSide?: "left" | "right";
    };
  };
  config?: {
    percentButtons?: {label: string, value: number}[];
  };
}

export interface ProviderArgs {
  partnerChainId?: number;
  widgetSettings?: WidgetUISettings;
  className?: string;
  slippage?: number;
  provider?: any;
  account?: string;
  chainId?: number;
  partner: string;
  apiUrl?: string;
  quoteInterval?: number;
  disableAnalytics?: boolean;
  web3?: Web3;
};





import Web3 from "web3";
export interface QuoteArgs {
  inToken: string;
  outToken: string;
  inAmount: string;
  account?: string;
  slippage?: number;
  chainId: number;
  dexAmountOut?: string;
  signal?: AbortSignal;
  partner: string;
  apiUrl?: string;
}
export interface SendTxArgs {
  user: string;
  inToken: string;
  outToken: string;
  inAmount: string;
  outAmount: string;
  signature: string;
  quoteResult: any;
  chainId: number;
}

export interface ApproveArgs {
  user: string;
  inToken: string;
  inAmount: string;
  provider: any;
}

export interface SwapState {
  isWon: boolean;
  isFailed: boolean;
  outAmount?: string;
  waitingForApproval: boolean;
  waitingForSignature: boolean;
  isSwapping: boolean;
  isQuoting: boolean;
  updateState: (state: Partial<SwapState>) => void;
}

export interface SubmitTxArgs {
  srcToken: string;
  destToken: string;
  srcAmount: string;
  signature: string;
  quote: QuoteResponse;
}

export interface UseSwapCallback {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  quote?: QuoteResponse;
  approved?: boolean;
}

export interface QuoteResponse {
  outAmount: string;
  permitData: any;
  serializedOrder: string;
  callData: string;
  rawData: any;
  outAmountUI: string;
  outAmountUIWithSlippage?: string;
}

export enum LH_CONTROL {
  FORCE = "1",
  SKIP = "2",
  RESET = "3",
}

export enum STEPS {
  WRAP,
  APPROVE,
  SIGN,
  SEND_TX,
}

export type ActionStatus = "loading" | "success" | "failed" | undefined;

export interface Step {
  title: string;
  loadingTitle: string;
  link?: { href: string; text: string };
  image?: string;
  hidden?: boolean;
  id: STEPS;
}

export type QuoteQueryArgs = {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  dexAmountOut?: string;
  slippage?: number;
  swapTypeIsBuy?: boolean;
  disabled?: boolean;
};

export type ChainConfig = {
  explorerUrl: string;
  wTokenAddress: string;
};

export type UseLiquidityHubArgs = {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  fromAmountUI?: string;
  fromTokenUsd?: string | number;
  toTokenUsd?: string | number;
  dexAmountOut?: string;
  dexAmountOutUI?: string;
  slippage?: number;
  swapTypeIsBuy?: boolean;
  ignoreSlippage?: boolean;
  disabled?: boolean;
};

export type UseConfirmSwap = {
  args: UseLiquidityHubArgs;
  quote?: QuoteResponse;
  tradeOwner?: TradeOwner;
};

export type ConfirmSwapCallback = {
  onSuccess?: () => void;
  fallback?: () => void;
};

export type TradeOwner = "dex" | "lh";

export type Order = {
  id: string;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  fromAmountUsd?: string;
};

export type Orders = { [address: string]: { [chain: string]: Order[] } };



export interface Network {
  native: Token;
  getTokens: () => Promise<Token[]>;
  wToken?: Token;
  chainId: number;
  chainName: string;
  explorerUrl: string;
}
