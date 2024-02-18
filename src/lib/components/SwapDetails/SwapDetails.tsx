import { PriceCompare } from "./PriceCompare";
import styled from "styled-components";
import { Text } from "../Text";
import { ReactNode, useMemo, useState } from "react";
import BN from "bignumber.js";
import { GasIcon } from "lib/assets/svg/gas";
import { ChevronDown } from "react-feather";
import { FlexRow, FlexColumn } from "lib/base-styles";
import { useFormatNumber } from "lib/hooks/useFormatNumber";
import { useTransactionEstimateGas } from "lib/hooks/useTransactionEstimateGas";
import { DEFAULT_SLIPPAGE } from "lib/config/consts";
import { useWidgetStore } from "../widget/store";
import { useWidget } from "../widget/hooks";

const StyledRowLabel = styled(Text)`
  font-size: 14px;
  font-weight: 500;
  opacity: 0.8;
`;

const StyledRowChildren = styled.div`
  font-size: 14px;
  * {
    font-size: inherit;
  }

`;

const TxGasCost = () => {
  return (
    <Row label="Network cost">
      <GasPrice />
    </Row>
  );
};

const Row = ({ label, children }: { label: string; children: ReactNode }) => {
  return (
    <StyledRow>
      <StyledRowLabel>{label}</StyledRowLabel>
      <StyledRowChildren>{children}</StyledRowChildren>
    </StyledRow>
  );
};

const StyledRow = styled(FlexRow)`
  justify-content: space-between;
  width: 100%;
`;

const MinAmountOut = () => {
  const fromToken = useWidgetStore((s) => s.fromToken);
  const toAmount = useWidget().quote?.outAmountUI
  const slippage = DEFAULT_SLIPPAGE;
  const symbol = fromToken?.symbol;
  const minAmountOut = useMemo(() => {
    if (!toAmount || !slippage) return "0";
    const _slippage = slippage / 2;
    return new BN(toAmount)
      .times(100 - _slippage)
      .div(100)
      .toString();
  }, [slippage, toAmount]);

  const _minAmountOut = useFormatNumber({ value: minAmountOut });

  return (
    <Row label="Minimum amout out">
      <Text>{`${_minAmountOut} ${symbol}`}</Text>
    </Row>
  );
};

const StyledDetails = styled(FlexColumn)`
  padding-top: 15px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderMain};
  margin-top: 15px;
  gap: 20px;
  width: 100%;
`;

export function SwapDetails({
  className,
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const fromAmount = useWidgetStore((s) => s.fromAmount);
  if (!fromAmount) return null;
  return (
    <StyledSwapDetails className={className}>
      <StyledTop>
        <PriceCompare />
        <OpenBtn open={open} onClick={() => setOpen(!open)} />
      </StyledTop>

      <StyledDetails>
        <TxGasCost />
        <MinAmountOut />
      </StyledDetails>
    </StyledSwapDetails>
  );
}

const StyledTop = styled(FlexRow)`
  width: 100%;
  justify-content: space-between;
`;

const GasPrice = () => {
  const txGasPrice = useTransactionEstimateGas();
  const _txGasPrice = useFormatNumber({ value: txGasPrice, decimalScale: 1 });

  return (
    <StyledGasPrice>
      <GasIcon />
      <Text>${_txGasPrice}</Text>
    </StyledGasPrice>
  );
};

const OpenBtn = ({ open, onClick }: { open: boolean; onClick: () => void }) => {
  return (
    <StyledOpenButton onClick={onClick}>
      {!open && <GasPrice />}
      <StyledArrow $transform={open} />
    </StyledOpenButton>
  );
};

const StyledOpenButton = styled(FlexRow)`
cursor: pointer;
width: auto;
min-width: 50px;
justify-content: flex-end;
`


const StyledArrow = styled(ChevronDown)<{ $transform: boolean }>`
  transition: 0.2s all;
  transform: ${(props) => (props.$transform ? "rotate(180deg)" : "rotate(0)")};
  color: ${({ theme }) => theme.colors.textMain}!important;
  width: 20px;
  height: 20px;
`;

const StyledSwapDetails = styled(FlexColumn)`
  width: 100%;
`;

const StyledGasPrice = styled(FlexRow)`
  gap: 5px;

`;
