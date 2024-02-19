import { createContext, useContext, useEffect, useState } from "react";
import { TokenPanelProps } from "./type";
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
} from "./styles";
import { ArrowDown } from "react-feather";
import { Text } from "lib/components/Text";
import { TokenModal } from "./components/TokenSelectModal/TokenSelectModal";
import { Balance } from "lib/components/Balance";
import { USD } from "lib/components/USD";
import { Logo } from "lib/components/Logo";
import { useUsdAmount } from "lib/hooks/useUsdAmount";
import {
  useBalances,
  useShowConfirmation,
  useSortedTokens,
  useTokenBalance,
} from "lib/hooks";
import styled, { CSSObject, ThemeProvider } from "styled-components";
import { Spinner } from "./components/Spinner";
import { useWidgetStore } from "./store";
import {
  LiquidityHubProvider,
  ProviderArgs,
  SwapModal,
  useFormatNumber,
  useWeb3,
} from "@orbs-network/liquidity-hub-ui";
import { FlexRow } from "lib/base-styles";
import { useWidget } from "./hooks/useWidget";
import { usePercentSelect } from "./hooks/usePercentSelect";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "./theme";
import { setWeb3Instance } from "@defi.org/web3-candies";


const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});


interface ContextProps {
  connectWallet?: () => void;
  styles?: CSSObject;
  layout?: {
    tokenPanel?: {
      percentButtons?: { label: string; value: number }[];
      headerOutside?: boolean;
      inputSide?: "left" | "right";
      usdSide?: "left" | "right";
    };
  };
}

const Context = createContext({} as ContextProps);

const useWidgetContext = () => {
  return useContext(Context);
};

const defaultPercentButtons = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
];

const PercentButtons = () => {
  const onPercentageChange = usePercentSelect();
  const percentButtons =
    useWidgetContext().layout?.tokenPanel?.percentButtons ||
    defaultPercentButtons;
  return (
    <StyledPercentButtons className="lh-percent-container">
      {percentButtons?.map((it, index) => {
        return (
          <button key={index} onClick={() => onPercentageChange(it.value)}>
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
  return (
    <StyledTokenSelect
      $selected={!!symbol}
      onClick={onClick}
      className={`lh-token-select ${symbol ? "lh-token-select-selected" : ""}`}
    >
      {logoUrl && <Logo src={logoUrl} className="lh-token-logo" />}
      <Text className="lh-token-symnol">{symbol || "Select token"}</Text>
    </StyledTokenSelect>
  );
};

interface WidgetProps extends ContextProps {}

export function WidgetContent(props: WidgetProps) {
  const web3 = useWeb3()

  useEffect(() => {
   setWeb3Instance(web3);
  }, [web3]);
  

  useInitialTokens();

  return (
    <Context.Provider value={props}>
      <Container>
        <FromTokenPanel />
        <ChangeTokens />
        <ToTokenPanel />
        <StyledSwapDetails />
        <SwapSubmitButton />
        <SwapModal />
      </Container>
    </Context.Provider>
  );
}

const useInitialTokens = () => {
  const { updateStore, fromToken, toToken } = useWidgetStore((s) => ({
    updateStore: s.updateStore,
    fromToken: s.fromToken,
    toToken: s.toToken,
  }));

  const { sortedTokens } = useSortedTokens();

  useEffect(() => {
    if (!sortedTokens) return;

    if (!fromToken) {
      updateStore({ fromToken: sortedTokens[1] });
    }
    if (!toToken) {
      updateStore({ toToken: sortedTokens[2] });
    }
  }, [sortedTokens, fromToken, toToken]);
};

export const SwapSubmitButton = () => {
  const { refetch: refetchBalances } = useBalances();
  const { connectWallet } = useWidgetContext();
  const store = useWidgetStore();
  const { quote, quoteError, confirmSwap, swapLoading, quoteLoading } =
    useWidget();

  const { disabled, text, onClick, isLoading } = useShowConfirmation({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount: store.fromAmount,
    toAmount: quote?.outAmountUI,
    error: !!quoteError,
    onClick: () =>
      confirmSwap({
        onSuccess: refetchBalances,
      }),
    isLoading: swapLoading || quoteLoading,
    onConnect: connectWallet,
  });

  return (
    <StyledSubmitButton
      className={`lh-swap-button`}
      $disabled={disabled}
      disabled={disabled}
      onClick={onClick ? () => onClick() : () => {}}
    >
      <p style={{ opacity: isLoading ? 0 : 1 }}>{text}</p>
      {isLoading ? (
        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>
      ) : null}
    </StyledSubmitButton>
  );
};

const SpinnerContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const StyledSubmitButton = styled.button<{ $disabled?: boolean }>`
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "unset")};
  font-size: 16px;
  width: 100%;
  border: unset;
  font-weight: 600;
  margin-top: 20px;
  min-height: 52px;
  border-radius: 10px;
  position: relative;
  cursor: ${({ $disabled }) => ($disabled ? "unset" : "pointer")};
  background: ${({ $disabled, theme }) =>
    $disabled ? theme.colors.buttonDisabled : theme.colors.button};
  color: ${({ $disabled, theme }) =>
    $disabled ? theme.colors.buttonDisabledText : theme.colors.buttonText};
`;

const Container = ({ children }: { children: React.ReactNode }) => {
  const styles = useWidgetContext().styles;

  return <StyledContainer $style={styles}>{children}</StyledContainer>;
};

const ChangeTokens = () => {
  const onSwitchTokens = useWidgetStore((store) => store.onSwitchTokens);

  return (
    <StyledChangeTokens className="lh-switch-tokens">
      <button onClick={onSwitchTokens}>
        <ArrowDown />
      </button>
    </StyledChangeTokens>
  );
};

const FromTokenPanel = () => {
  const { token, amount, onChange } = useWidgetStore((s) => ({
    token: s.fromToken,
    amount: s.fromAmount,
    onChange: s.onFromAmountChange,
  }));

  const usd = useUsdAmount({ address: token?.address, amount });

  return (
    <TokenPanel
      token={token}
      usd={usd}
      inputValue={amount || ""}
      onInputChange={onChange}
      label="From"
      isSrc={true}
    />
  );
};

const ToTokenPanel = () => {
  const { token } = useWidgetStore((s) => ({
    token: s.toToken,
  }));

  const amount = useWidget().quote?.outAmountUI;
  const usd = useUsdAmount({ address: token?.address, amount });
  const inputValue = useFormatNumber({ value: amount });

  return (
    <TokenPanel
      token={token}
      usd={usd}
      inputValue={inputValue || ""}
      label="To"
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
  return (
    <StyledTop className="lh-token-panel-header">
      <Text className="lh-token-panel-label">{label}</Text>
      {isSrc && <PercentButtons />}
    </StyledTop>
  );
};

const TokenPanel = ({
  inputValue,
  onInputChange,
  token,
  label,
  isSrc,
}: TokenPanelProps) => {
  const [open, setOpen] = useState(false);
  const tokenPanelLayout = useWidgetContext().layout?.tokenPanel;
  const usd = useUsdAmount({ address: token?.address, amount: inputValue });
  const headerOutside = tokenPanelLayout?.headerOutside;
  const inputLeft = tokenPanelLayout?.inputSide === "left";
  const usdLeft = tokenPanelLayout?.usdSide === "left";

  const balance = useFormatNumber({ value: useTokenBalance(token?.address) });

  const header = <TokenPanelHeader isSrc={isSrc} label={label} />;

  return (
    <>
      <StyledTokenPanel
        $inputLeft={inputLeft}
        $usdLeft={usdLeft}
        className="lh-token-panel-container"
      >
        {headerOutside && header}
        <StyledTokenPanelContent className="lh-token-panel-container-content">
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
        isFromToken={isSrc}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export interface Props extends ProviderArgs, ContextProps {}

export const Widget = (props: Props) => {  
  return (
    <LiquidityHubProvider {...props}>
      <QueryClientProvider client={client}>
        <ThemeProvider theme={theme}>
          <WidgetContent connectWallet={props.connectWallet} styles={props.styles} layout={props.layout} />
        </ThemeProvider>
      </QueryClientProvider>
    </LiquidityHubProvider>
  );
};
