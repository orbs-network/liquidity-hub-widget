import { useEffect, useMemo, useState } from "react";
import {
  useFromAmount,
  useOnPercentClickCallback,
  useToAmount,
  useTokenAmountUSD,
  useTokenFromTokenList,
} from "lib/hooks";
import { useSwapStore } from "lib/store";
import { ThemeProvider } from "styled-components";
import Web3 from "web3";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { TokenPanelProps, WidgetArgs } from "../type";
import {
  LiquidityHubProvider,
  useFormatNumber,
} from "@orbs-network/liquidity-hub-lib";
import { getTheme } from "lib/theme";
import { setWeb3Instance } from "@defi.org/web3-candies";
import { useWidgetContext, WidgetContextProvider } from "lib/context";
import {
  StyledChangeTokens,
  StyledContainer,
  StyledInput,
  StyledPercentButtons,
  StyledSwapDetails,
  StyledTokenPanel,
  StyledTokenPanelContent,
  StyledTokenSelect,
  StyledTop,
} from "../styles";
import { ArrowDown } from "react-feather";
import { Text } from "lib/components/Text";
import { TokenModal } from "lib/components/TokenSelectModal/TokenSelectModal";
import { Balance } from "lib/components/Balance";
import { USD } from "lib/components/USD";
import { Logo } from "lib/components/Logo";
import { FlexRow } from "lib/base-styles";
import { SwapSubmitButton } from "lib/components/SwapSubmitButton";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const defaultPercentButtons = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
];

const PercentButtons = () => {
  const onPercentageChange = useOnPercentClickCallback();
  const styles =
    useWidgetContext().uiSettings?.styles?.tokenPanel?.percentButtons;
  const percentButtons =
    useWidgetContext().uiSettings?.config?.percentButtons ||
    defaultPercentButtons;
  return (
    <StyledPercentButtons className="clob-token-panel-percent" $style={styles}>
      {percentButtons?.map((it, index) => {
        return (
          <button
            key={index}
            className="clob-token-panel-percent-btn"
            onClick={() => onPercentageChange(it.value)}
          >
            {it.label}
          </button>
        );
      })}
    </StyledPercentButtons>
  );
};

const TokenSelect = ({
  symbol,
  logoUrl,
  onClick,
}: {
  symbol?: string;
  logoUrl?: string;
  onClick: () => void;
}) => {
  const styles =
    useWidgetContext().uiSettings?.styles?.tokenPanel?.tokenSelector;

  return (
    <StyledTokenSelect
      $selected={!!symbol}
      onClick={onClick}
      className={`clob-token-panel-select ${
        symbol ? "clob-token-panel-select-selected" : ""
      }`}
      $style={styles}
    >
      {logoUrl && (
        <Logo src={logoUrl} className="clob-token-panel-select-logo" />
      )}
      <Text className="clob-token-panel-select-text">
        {symbol || "Select token"}
      </Text>
    </StyledTokenSelect>
  );
};

export function Swap({ className = "" }: { className?: string }) {
  return (
    <Container className={className}>
      <FromTokenPanel />
      <ChangeTokens />
      <ToTokenPanel />
      <StyledSwapDetails />
      <SwapSubmitButton />
    </Container>
  );
}

const Container = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerStyles = useWidgetContext().uiSettings?.styles?.container;

  return (
    <StyledContainer className={className} $style={containerStyles}>
      {children}
    </StyledContainer>
  );
};

const ChangeTokens = () => {
  const onSwitchTokens = useSwapStore((store) => store.onSwitchTokens);
  const styles = useWidgetContext().uiSettings?.styles?.switchTokens;

  return (
    <StyledChangeTokens
      className="clob-token-panel-switch-tokens"
      $style={styles}
    >
      <button onClick={onSwitchTokens}>
        <ArrowDown />
      </button>
    </StyledChangeTokens>
  );
};

const FromTokenPanel = () => {
  const { onFromAmountChange, onFromTokenChange, fromToken } = useSwapStore();
  const fromAmount = useFromAmount();  

  const usd = useTokenAmountUSD(fromToken, fromAmount);
  const balance = useTokenFromTokenList(fromToken)?.balance;

  return (
    <TokenPanel
      token={fromToken}
      usd={usd}
      onSelectToken={onFromTokenChange}
      inputValue={fromAmount || ""}
      onInputChange={onFromAmountChange}
      label="From"
      isSrc={true}
      balance={balance}
    />
  );
};

const ToTokenPanel = () => {
  const { onToTokenChange, toToken, onToAmountChange } = useSwapStore();
  const amount = useToAmount()?.uiAmount;

  const usd = useTokenAmountUSD(toToken, amount);
  const toAmount = useToAmount();
  const inputValue = useFormatNumber({ value: toAmount?.uiAmount });
  const balance = useTokenFromTokenList(toToken)?.balance;

  return (
    <TokenPanel
      token={toToken}
      usd={usd}
      onSelectToken={onToTokenChange}
      inputValue={inputValue || ""}
      onInputChange={onToAmountChange}
      label="To"
      balance={balance}
    />
  );
};

const TokenPanelHeader = ({
  isSrc,
  label,
}: {
  isSrc?: boolean;
  label?: string;
}) => {
  const { uiSettings } = useWidgetContext();

  const styles = uiSettings?.styles?.tokenPanel?.header;

  return (
    <StyledTop className="clob-token-panel-top" $style={styles}>
      <Text className="clob-token-panel-label">{label}</Text>
      {isSrc && <PercentButtons />}
    </StyledTop>
  );
};

const TokenPanel = ({
  usd,
  onSelectToken,
  inputValue,
  onInputChange,
  token,
  label,
  isSrc,
  balance,
}: TokenPanelProps) => {
  const [open, setOpen] = useState(false);
  const { uiSettings } = useWidgetContext();
  const styles = uiSettings?.styles?.tokenPanel?.container;

  const settings = uiSettings?.layout?.tokenPanel;
  const headerOutside = settings?.headerOutside;
  const inputLeft = settings?.inputSide === "left";
  const usdLeft = settings?.usdSide === "left";

  const header = <TokenPanelHeader isSrc={isSrc} label={label} />;

  return (
    <>
      <StyledTokenPanel $inputLeft={inputLeft} $usdLeft={usdLeft}>
        {headerOutside && header}
        <StyledTokenPanelContent $style={styles} className="clob-token-panel">
          {!headerOutside && header}
          <FlexRow style={{ width: "100%", gap: 12 }}>
            <>
              <StyledInput
                onChange={onInputChange}
                value={inputValue}
                placeholder="0.00"
                $alignLeft={inputLeft}
                disabled={!isSrc}
              />
              <TokenSelect
                symbol={token?.symbol}
                logoUrl={token?.logoUrl}
                onClick={() => setOpen(true)}
              />
            </>
          </FlexRow>
          <FlexRow
            style={{
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Balance value={balance} />
            <USD value={usd} />
          </FlexRow>
        </StyledTokenPanelContent>
      </StyledTokenPanel>
      <TokenModal
        onTokenSelect={onSelectToken}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const Widget = (args: WidgetArgs) => {
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
          <WidgetContextProvider widgetArgs={args}>
            <Swap className={args.className} />
          </WidgetContextProvider>
        </ThemeProvider>
      </LiquidityHubProvider>
    </QueryClientProvider>
  );
};
