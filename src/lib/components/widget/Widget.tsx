import { useEffect, useState } from "react";
import { TokenPanelProps } from "../../type";
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
} from "../../styles";
import { ArrowDown } from "react-feather";
import { Text } from "lib/components/Text";
import { TokenModal } from "./TokenSelectModal/TokenSelectModal";
import { Balance } from "lib/components/Balance";
import { USD } from "lib/components/USD";
import { Logo } from "lib/components/Logo";
import { FlexRow } from "lib/base-styles";
import { useUsdAmount } from "lib/hooks/useUsdAmount";
import { SwapModal } from "../swap-modal/SwapModal";
import { useFormatNumber } from "lib/hooks/useFormatNumber";
import { useMainContext } from "lib/provider";
import {
  useBalances,
  useShowConfirmation,
  useSortedTokens,
  useTokenBalance,
} from "lib/hooks";
import styled from "styled-components";
import { Spinner } from "../Spinner";
import { useWidgetStore } from "./store";
import { usePercentSelect, useWidget } from "./hooks";
import { useConnectModal } from "@rainbow-me/rainbowkit";

const defaultPercentButtons = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
];

const PercentButtons = () => {
  const onPercentageChange = usePercentSelect();
  const styles =
    useMainContext().widgetSettings?.styles?.tokenPanel?.percentButtons;
  const percentButtons =
    useMainContext().widgetSettings?.config?.percentButtons ||
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
    useMainContext().widgetSettings?.styles?.tokenPanel?.tokenSelector;

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

export function Widget({ className = "" }: { className?: string }) {
  useInitialTokens();

  return (
    <Container className={className}>
      <FromTokenPanel />
      <ChangeTokens />
      <ToTokenPanel />
      <StyledSwapDetails />
      <SwapSubmitButton />
      <SwapModal />
    </Container>
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
  const { openConnectModal } = useConnectModal();

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
    onConnect: openConnectModal,
  });

  const btnStyles = useMainContext().widgetSettings?.styles?.submitButton;

  return (
    <StyledSubmitButton
      className={`clob-submit-button`}
      $disabled={disabled}
      disabled={disabled}
      onClick={onClick ? () => onClick() : () => {}}
      style={btnStyles}
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

const Container = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerStyles = useMainContext().widgetSettings?.styles?.container;

  return (
    <StyledContainer className={className} $style={containerStyles}>
      {children}
    </StyledContainer>
  );
};

const ChangeTokens = () => {
  const onSwitchTokens = useWidgetStore((store) => store.onSwitchTokens);
  const styles = useMainContext().widgetSettings?.styles?.switchTokens;

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
  const widgetSettings = useMainContext().widgetSettings;

  const styles = widgetSettings?.styles?.tokenPanel?.header;

  return (
    <StyledTop className="clob-token-panel-top" $style={styles}>
      <Text className="clob-token-panel-label">{label}</Text>
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
  const widgetSettings = useMainContext().widgetSettings;
  const usd = useUsdAmount({ address: token?.address, amount: inputValue });
  const styles = widgetSettings?.styles?.tokenPanel?.container;
  const settings = widgetSettings?.layout?.tokenPanel;
  const headerOutside = settings?.headerOutside;
  const inputLeft = settings?.inputSide === "left";
  const usdLeft = settings?.usdSide === "left";

  const balance = useFormatNumber({ value: useTokenBalance(token?.address) });

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
        isFromToken={isSrc}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};
