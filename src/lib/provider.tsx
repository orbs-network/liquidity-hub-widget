import { setWeb3Instance } from "@defi.org/web3-candies";
import {
  ProviderArgs,
  LiquidityHubProvider,
  useWeb3,
} from "@orbs-network/liquidity-hub-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { useResetOnChainChanged } from "./hooks/useResetOnChainChanged";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export interface Props extends ProviderArgs {
  initialFromToken?: string;
  initialToToken?: string;
  children: React.ReactNode;
}

export const Provider = (args: Props) => {

  return (
    <LiquidityHubProvider {...args} slippage={args.slippage || 0.5}>
      <QueryClientProvider client={client}>
          <Content>{args.children}</Content>
      </QueryClientProvider>
    </LiquidityHubProvider>
  );
};

const Content = ({ children }: { children: ReactNode }) => {
  useResetOnChainChanged();
  const web3 = useWeb3();

  useEffect(() => {
    setWeb3Instance(web3);
  }, [web3]);

  return <>{children}</>;
};
