import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  TokenPanelProps,
  WidgetConfig,
  WidgetLayout,
  GetPriceUSD,
  ModalStyles,
} from "./type";
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
import { Balance } from "lib/components/Balance";
import { USD } from "lib/components/USD";
import { Logo } from "lib/components/Logo";
import { useUsdAmount } from "lib/hooks/useUsdAmount";
import {
  usePriceUsd,
  useShowConfirmationButton,
  useTokenListBalance,
  useTokens,
} from "lib/hooks";
import styled, { CSSObject, ThemeProvider } from "styled-components";
import { Spinner } from "./components/Spinner";
import {
  ProviderArgs,
  SwapConfirmation,
  Token,
  useFormatNumber,
  useSwapConfirmation,
  useWeb3,
  PoweredByOrbs,
  useAccount,
} from "@orbs-network/liquidity-hub-ui";
import { FlexColumn, FlexRow } from "lib/base-styles";
import { usePercentSelect } from "./hooks/usePercentSelect";
import { theme } from "./theme";
import { setWeb3Instance } from "@defi.org/web3-candies";
import { useInitialTokens } from "./hooks/useInitialTokens";
import { useResetOnChainChanged } from "./hooks/useResetOnChainChanged";
import { Provider } from "./provider";
import {
  useToTokenPanel,
  useFromTokenPanel,
  useSwapTokens,
} from "./hooks/swap";
import { useRefreshBalancesAfterTx } from "./hooks/useRefreshBalancesAfterTx";
import { TokenList } from "./components/TokenList";
import { Modal } from "./components/Modal";
import { Button } from "./components/Button";
import { LoadingText } from "./components/LoadingText";
import { TokenSearchInput } from "./components/SearchInput";
import { useSwapButton } from "./hooks/useSwapButton";
import { useMainStore } from "./store";
import { useShallow } from "zustand/react/shallow";

interface ContextProps {
  connectWallet?: () => void;
  styles?: CSSObject;
  layout?: WidgetLayout;
  modal?: ModalStyles;
  initialFromToken?: string;
  initialToToken?: string;
}

const Context = createContext({} as ContextProps);

const useWidgetContext = () => {
  return useContext(Context);
};

const WidgetModal = ({
  children,
  open,
  onClose,
  title,
}: {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  title: string;
}) => {
  const modal = useWidgetContext().modal;

  return (
    <Modal
      title={title}
      containerStyles={modal?.containerStyles}
      bodyStyles={modal?.bodyStyles}
      open={open}
      onClose={onClose}
    >
      {children}
    </Modal>
  );
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
  onSelect,
}: {
  symbol?: string;
  logoUrl?: string;
  onSelect: (token: Token) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const tokens = useTokens(filterValue);

  const onTokenSelect = (token: Token) => {
    onSelect(token);
    setOpen(false);
  };
  return (
    <>
      <StyledTokenSelect
        $selected={!!symbol}
        onClick={() => setOpen(true)}
        className={`lh-token-select ${
          symbol ? "lh-token-select-selected" : ""
        }`}
      >
        {logoUrl && <Logo src={logoUrl} className="lh-token-logo" />}
        <Text className="lh-token-symnol">{symbol || "Select token"}</Text>
      </StyledTokenSelect>
      <WidgetModal
        title="Select token"
        open={open}
        onClose={() => setOpen(false)}
      >
        <TokenSearchInput value={filterValue} setValue={setFilterValue} />
        <StyledTokenListContainer>
          <TokenList
            tokens={tokens}
            onTokenSelect={onTokenSelect}
            ListItem={TokenListItem}
          />
        </StyledTokenListContainer>
      </WidgetModal>
    </>
  );
};

export function WidgetContent(props: ContextProps) {
  const web3 = useWeb3();
  useEffect(() => {
    setWeb3Instance(web3);
  }, [web3]);

  useInitialTokens(props.initialFromToken, props.initialToToken);
  useResetOnChainChanged();

  return (
    <Context.Provider value={props}>
      <Container>
        <FromTokenPanel />
        <ChangeTokens />
        <ToTokenPanel />
        <StyledSwapDetails />
        <SwapSubmitButton />
        <SwapModal />
        <StyledPoweredByOrbs />
      </Container>
    </Context.Provider>
  );
}

const StyledPoweredByOrbs = styled(PoweredByOrbs)`
  margin-top: 30px;
`;

const SwapModal = () => {
  const { showModal, closeModal, title } = useSwapConfirmation();
  const onSuccess = useRefreshBalancesAfterTx();
  const { swap, isPending, text, showButton } = useSwapButton();

  const onClick = useCallback(() => {
    swap(onSuccess);
  }, [swap, onSuccess]);

  return (
    <WidgetModal title={title} open={showModal} onClose={closeModal}>
      <SwapConfirmation />
      {showButton && (
        <StyledSubmitButton onClick={onClick} isLoading={isPending}>
          {text}
        </StyledSubmitButton>
      )}
    </WidgetModal>
  );
};

export const SwapSubmitButton = () => {
  const { connectWallet } = useWidgetContext();
  const { fromToken, toToken } = useMainStore(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
    }))
  );
  const fromTokenUsd = usePriceUsd({ address: fromToken?.address }).data;
  const toTokenUsd = usePriceUsd({ address: toToken?.address }).data;
  const { disabled, text, onClick, quoteLoading, switchNetworkLoading } =
    useShowConfirmationButton(fromTokenUsd || '', toTokenUsd || '');

  const account = useAccount();
  const isLoading = quoteLoading || switchNetworkLoading;

  const _onClick = !account ? connectWallet : onClick;
  const _text = !account ? "Connect Wallet" : text;

  return (
    <StyledSubmitButton
      className={`lh-swap-button`}
      $disabled={disabled}
      disabled={disabled}
      onClick={() => _onClick?.()}
    >
      <p style={{ opacity: isLoading ? 0 : 1 }}>{_text}</p>
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

const StyledSubmitButton = styled(Button)<{ $disabled?: boolean }>`
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
  const swapTokens = useSwapTokens();
  return (
    <StyledChangeTokens className="lh-switch-tokens">
      <button onClick={swapTokens}>
        <ArrowDown />
      </button>
    </StyledChangeTokens>
  );
};

const FromTokenPanel = () => {
  const { token, amount, onChange, onTokenSelect } = useFromTokenPanel();

  const usd = useFormatNumber({
    value: useUsdAmount({ address: token?.address, amount }),
  });

  return (
    <TokenPanel
      token={token}
      usd={usd}
      inputValue={amount || ""}
      onInputChange={onChange}
      label="From"
      isSrc={true}
      onTokenSelect={onTokenSelect}
    />
  );
};

const ToTokenPanel = () => {
  const { token, amount, onTokenSelect } = useToTokenPanel();
  const usd = useFormatNumber({
    value: useUsdAmount({ address: token?.address, amount }),
  });
  return (
    <TokenPanel
      onTokenSelect={onTokenSelect}
      token={token}
      usd={usd}
      inputValue={amount || ""}
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
  onTokenSelect,
}: TokenPanelProps) => {
  const context = useWidgetContext();
  const tokenPanelLayout = context.layout?.tokenPanel;
  const usd = useUsdAmount({ address: token?.address, amount: inputValue });
  const headerOutside = tokenPanelLayout?.headerOutside;
  const inputLeft = tokenPanelLayout?.inputSide === "left";
  const usdLeft = tokenPanelLayout?.usdSide === "left";
  const balance = useFormatNumber({
    value: useTokenListBalance(token?.address),
  });

  const header = <TokenPanelHeader isSrc={isSrc} label={label} />;

  return (
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
              onSelect={onTokenSelect}
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
  );
};

export interface Props extends ProviderArgs {
  connectWallet?: () => void;
  config?: WidgetConfig;
  getPriceUsd?: GetPriceUSD;
  initialFromToken?: string;
  initialToToken?: string;
}

export const Widget = (props: Props) => {
  return (
    <Provider {...props}>
      <ThemeProvider theme={theme}>
        <WidgetContent
          connectWallet={props.connectWallet}
          styles={props.config?.styles}
          layout={props.config?.layout}
          modal={props.config?.modalStyles}
          initialFromToken={props.initialFromToken}
          initialToToken={props.initialToToken}
        />
      </ThemeProvider>
    </Provider>
  );
};

export const TokenListItem = ({
  token,
  disabled,
}: {
  token: Token;
  disabled?: boolean;
}) => {
  const _balance = useTokenListBalance(token.address);
  const _usd = useUsdAmount({
    address: token.address,
    amount: _balance,
  });

  const balance = useFormatNumber({ value: _balance });
  const usd = useFormatNumber({ value: _usd });

  return (
    <StyledListToken $disabled={disabled}>
      <FlexRow
        style={{
          width: "unset",
          flex: 1,
          justifyContent: "flex-start",
          gap: 10,
        }}
      >
        <Logo
          className="logo"
          src={token.logoUrl}
          alt={token.symbol}
          imgStyle={{
            width: 30,
            height: 30,
          }}
        />
        <FlexColumn style={{ alignItems: "flex-start" }}>
          <Text className="symbol">{token.symbol}</Text>
          {token.name && (
            <StyledTokenName className="name">{token.name}</StyledTokenName>
          )}
        </FlexColumn>
      </FlexRow>
      <FlexColumn
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}
      >
        <StyledBalance isLoading={!balance} value={balance} />
        {usd && <StyledUSD value={`$ ${usd}`} />}
      </FlexColumn>
    </StyledListToken>
  );
};

const StyledTokenName = styled(Text)`
  font-size: 12px;
  opacity: 0.8;
`;

const StyledBalance = styled(LoadingText)`
  font-size: 14px;
`;

const StyledUSD = styled(LoadingText)`
  font-size: 12px;
  opacity: 0.8;
`;

export const StyledListToken = styled.div<{ $disabled?: boolean }>(
  ({ $disabled }) => ({
    cursor: "pointer",
    display: "flex",
    gap: 10,
    height: "100%",
    alignItems: "center",
    padding: "0px 20px",
    transition: "0.2s all",
    width: "100%",
    opacity: $disabled ? 0.5 : 1,
    pointerEvents: $disabled ? "none" : "all",
    "&:hover": {
      background: "rgba(255,255,255, 0.07)",
    },
  })
);

const StyledTokenListContainer = styled.div`
  max-height: 90vh;
  height: 700px;
  width: 100%;
  color: white;
  overflow-y: auto;
`;
