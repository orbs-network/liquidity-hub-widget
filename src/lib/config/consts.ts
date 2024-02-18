export const WEBSITE_URL = "https://www.orbs.com/";
export const DEFAULT_QUOTE_INTERVAL = 10_000
export const DEFAULT_API_ENDPOINT = "https://hub.orbs.network";


export enum QUERY_KEYS {
  TOKEN_BALANCE = "TOKEN_BALANCE",
  GET_TOKENS = "GET_TOKENS",
  GAS_PRICE = "GAS_PRICE",
  USD_PRICE = "USD_PRICE",
  TOKEN_BALANCES = "TOKEN_BALANCES",
  QUOTE = "QUOTE",
  SWAP = "SWAP",
  APPROVE = "APPROVE",
  BALANCE = "BALANCE",
  BALANCES = "BALANCES",
  SORTED_TOKENS = "SORTED_TOKENS",
  FILTER_TOKENS = "FILTER_TOKENS",
}

export const DEFAULT_SLIPPAGE = 0.3;








export const QUOTE_ERRORS = {
  tns: "tns",
  noLiquidity: "no liquidity",
};

export const THENA_TOKENS_LIST_API =
  "https://lhthena.s3.us-east-2.amazonaws.com/token-list-lh.json";