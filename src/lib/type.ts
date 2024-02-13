/* eslint-disable @typescript-eslint/no-explicit-any */

import { CSSObject } from "styled-components";
import {Token as LHToken} from "@orbs-network/liquidity-hub-lib"

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

export interface Token extends LHToken {
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

export interface ProviderArgs  {
  provider?: any;
  address?: string;
  connectedChainId?: number;
  partner?: string;
  partnerChainId?: number;
  onConnect?: () => void;
  uiSettings?: WidgetUISettings;
  apiUrl?: string;
  quoteInterval?: number;
  slippage?: number;
  className?: string;
  getUsdPrice?: (address: string, chainId:number) => Promise<number>;
};


export interface ProviderArgsWithChildren extends ProviderArgs {
  children: React.ReactNode;
}