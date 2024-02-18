import { useState } from "react";

import { useSwapStore } from "lib/store";
import { TokenPanelProps } from "../type";
import { SwapModal, useFormatNumber } from "@orbs-network/liquidity-hub-lib";
import { useSharedContext } from "lib/context";
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
import { useToken } from "lib/hooks/useToken";
import { useUsdAmount } from "lib/hooks/useUsdAmount";
import { useToAmount } from "lib/hooks";
import { usePercentSelect } from "lib/hooks/usePercentSelect";

const defaultPercentButtons = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
];

const PercentButtons = () => {
  const onPercentageChange = usePercentSelect();
  const styles =
    useSharedContext().widgetSettings?.styles?.tokenPanel?.percentButtons;
  const percentButtons =
    useSharedContext().widgetSettings?.config?.percentButtons ||
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
    useSharedContext().widgetSettings?.styles?.tokenPanel?.tokenSelector;

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

const Container = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerStyles = useSharedContext().widgetSettings?.styles?.container;

  return (
    <StyledContainer className={className} $style={containerStyles}>
      {children}
    </StyledContainer>
  );
};

const ChangeTokens = () => {
  const onSwitchTokens = useSwapStore((store) => store.onSwitchTokens);
  const styles = useSharedContext().widgetSettings?.styles?.switchTokens;

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
  const { onFromAmountChange, fromAmount, fromTokenAddress } = useSwapStore(
    (s) => ({
      onFromAmountChange: s.onFromAmountChange,
      fromAmount: s.fromAmount,
      fromTokenAddress: s.fromTokenAddress,
    })
  );
  const fromToken = useToken(fromTokenAddress);

  const usd = useUsdAmount(fromTokenAddress, fromAmount);

  return (
    <TokenPanel
      token={fromToken}
      usd={usd}
      inputValue={fromAmount || ""}
      onInputChange={onFromAmountChange}
      label="From"
      isSrc={true}
    />
  );
};

const ToTokenPanel = () => {
  const { onToAmountChange, toTokenAddress } = useSwapStore((s) => ({
    onToAmountChange: s.onToAmountChange,
    toTokenAddress: s.toTokenAddress,
  }));
  const amount = useToAmount()?.uiAmount;
  const toToken = useToken(toTokenAddress);

  const usd = useUsdAmount(toTokenAddress, amount);
  const toAmount = useToAmount();
  const inputValue = useFormatNumber({ value: toAmount?.uiAmount });

  return (
    <TokenPanel
      token={toToken}
      usd={usd}
      inputValue={inputValue || ""}
      onInputChange={onToAmountChange}
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
  const { widgetSettings } = useSharedContext();

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
  const { widgetSettings } = useSharedContext();
  const usd = useUsdAmount(token?.address, inputValue);
  const styles = widgetSettings?.styles?.tokenPanel?.container;
  const settings = widgetSettings?.layout?.tokenPanel;
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
            <Balance value={token?.balance} />
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
