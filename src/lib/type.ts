/* eslint-disable @typescript-eslint/no-explicit-any */

import { CSSObject } from "styled-components";


export interface TokenPanelProps {
  usd?: string | number;
  balance?: string;
  onSelectToken: (token: Token) => void;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  token?: Token;
  label?: string;
  isSrc?: boolean;
}

export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
  name?: string;
  balance?: string;
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

export type WidgetArgs = {
  provider?: any;
  address?: string;
  chainId?: number;
  partner?: string;
  supportedChain?: number;
  onConnect?: () => void;
  uiSettings?: WidgetUISettings;
  apiUrl?: string;
  quoteInterval?: number;
  slippage?: number;
  className?: string;
};
