import { LiquidityHubProvider } from "@orbs-network/liquidity-hub-lib";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Text } from "lib/components/Text";
import { WidgetContextProvider } from "lib/context";
import { getTheme } from "lib/theme";
import { ProviderArgs } from "lib/type";
import { ReactNode, useMemo } from "react";
import { ThemeProvider } from "styled-components";
const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

interface Props extends ProviderArgs {
  children: ReactNode;
}


export function UIProvider(args: Props) {
  const theme = useMemo(
    () => getTheme(args.widgetSettings),
    [args.widgetSettings]
  );
  const { provider, account, partner, chainId } = args;
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
        account={account}
        partner={partner}
        chainId={chainId}
        apiUrl={args.apiUrl}
        quoteInterval={args.quoteInterval}
      >
        <ThemeProvider theme={theme}>
          <WidgetContextProvider args={args}>
            {args.children}
          </WidgetContextProvider>
        </ThemeProvider>
      </LiquidityHubProvider>
    </QueryClientProvider>
  );
}
