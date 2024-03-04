import { Token } from "@orbs-network/liquidity-hub-ui";
import { CSSObject } from "styled-components";

export interface TokenPanelProps {
  inputValue?: string;
  onInputChange?: (value: string) => void;
  token?: Token;
  label?: string;
  isSrc?: boolean;
  onTokenSelect: (token: Token) => void;
}

export type GetPriceUSD = (address: string, chainId: number) => Promise<number>;

export type Balances = { [key: string]: string };

export interface ModalStyles {
  bodyStyles?: CSSObject;
  containerStyles?: CSSObject;
}

export type TokenListItemProps = {
  token: Token;
  selected?: boolean;
  balance?: string;
};

export interface WidgetConfig {
  styles?: CSSObject;
  layout?: WidgetLayout;
  modalStyles?: ModalStyles;
}

export interface WidgetLayout {
  tokenPanel?: {
    percentButtons?: { label: string; value: number }[];
    headerOutside?: boolean;
    inputSide?: "left" | "right";
    usdSide?: "left" | "right";
  };
}


export interface MainContextArgs {
  getTokens?: (chainId?: number) => Promise<Token[]>;
  getUsdPrice?: (address: string, chainId: number) => Promise<number>;
}