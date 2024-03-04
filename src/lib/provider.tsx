import {
  ProviderArgs,
  LiquidityHubProvider,
} from "@orbs-network/liquidity-hub-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { MainContextProvider } from "./context";
import { useInitialTokens } from "./hooks";
import { useResetOnChainChanged } from "./hooks/useResetOnChainChanged";
import { MainContextArgs } from "./type";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export interface Props extends ProviderArgs, MainContextArgs {
  fromToken?: string;
  toToken?: string;
  children: React.ReactNode;
}

export const Provider = (args: Props) => {
  return (
    <LiquidityHubProvider {...args} slippage={args.slippage || 0.5}>
      <QueryClientProvider client={client}>
        <MainContextProvider
          value={{ getUsdPrice: args.getUsdPrice, getTokens: args.getTokens }}
        >
          <Content {...args}>{args.children}</Content>
        </MainContextProvider>
      </QueryClientProvider>
    </LiquidityHubProvider>
  );
};

interface ContentProps extends Props {
  children: ReactNode;
}

const Content = (props: ContentProps) => {
  useResetOnChainChanged();
  useInitialTokens(props.fromToken, props.toToken);

  return <>{props.children}</>;
};
