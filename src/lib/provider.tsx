import { setWeb3Instance } from "@defi.org/web3-candies";
import { LiquidityHubProvider } from "@orbs-network/liquidity-hub-lib";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Text } from "lib/components/Text";
import { WidgetContextProvider } from "lib/context";
import { getTheme } from "lib/theme";
import {ProviderArgsWithChildren } from "lib/type";
import { useEffect, useMemo } from "react";
import { ThemeProvider } from "styled-components";
import Web3 from "web3";
const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});



export function UIProvider(args: ProviderArgsWithChildren) {
  const theme = useMemo(() => getTheme(args.uiSettings), [args.uiSettings]);
  const { provider, address, partner, connectedChainId } = args;

  useEffect(() => {
    setWeb3Instance(new Web3(provider));
  }, [provider]);

  if (!partner) {
    return (
      <div>
        <Text>Partner is required</Text>
      </div>
    );
  }
  return (
    <QueryClientProvider client={client}>
      <LiquidityHubProvider
        provider={provider}
        account={address}
        partner={partner}
        chainId={connectedChainId}
        apiUrl={args.apiUrl}
        quoteInterval={args.quoteInterval}
      >
        <ThemeProvider theme={theme}>
          <WidgetContextProvider {...args} />
        </ThemeProvider>
      </LiquidityHubProvider>
    </QueryClientProvider>
  );
}
