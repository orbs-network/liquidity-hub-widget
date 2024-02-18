import { setWeb3Instance } from "@defi.org/web3-candies";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getTheme } from "lib/theme";
import { ProviderArgs } from "lib/type";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { ThemeProvider } from "styled-components";
import { DEFAULT_API_ENDPOINT, DEFAULT_QUOTE_INTERVAL } from "./config/consts";
import Web3 from "web3";
import { swapAnalytics } from "./analytics";

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

interface ContextArgs extends ProviderArgs {
  web3?: Web3;
}

const Context = createContext({} as ContextArgs);

interface Props extends ProviderArgs {
  children: ReactNode;
}

export const LiquidityHubProvider = ({
  children,
  provider,
  account,
  chainId,
  partner,
  widgetSettings,
  quoteInterval = DEFAULT_QUOTE_INTERVAL,
  apiUrl = DEFAULT_API_ENDPOINT,
  partnerChainId,
}: Props) => {
  const theme = useMemo(() => getTheme(widgetSettings), [widgetSettings]);

  const web3 = useMemo(
    () => (provider ? new Web3(provider) : undefined),
    [provider]
  );

  useEffect(() => {
    if (web3) {
      setWeb3Instance(web3);
    } else {
      setWeb3Instance(undefined);
    }
  }, [web3]);

  useEffect(() => {
    if (chainId && partner) {
      swapAnalytics.setChainId(chainId);
      swapAnalytics.setPartner(partner);
    }
  }, [chainId, partner]);

  return (
    <QueryClientProvider client={client}>
      <Context.Provider
        value={{
          provider,
          account,
          chainId,
          partner,
          quoteInterval,
          apiUrl,
          web3,
          partnerChainId,
        }}
      >
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Context.Provider>
    </QueryClientProvider>
  );
};

export const useMainContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useMainContext must be used within a LHProvider");
  }
  return context;
};
