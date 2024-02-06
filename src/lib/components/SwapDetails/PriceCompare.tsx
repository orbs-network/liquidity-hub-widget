
import { useMemo, useState } from "react";
import styled from "styled-components";
import { useUSDPriceQuery } from "../../hooks";
import { useSwapStore } from "../../store";
import { Text } from "../Text";
import { useFormatNumber } from "@orbs-network/liquidity-hub-lib";
import { FlexRow } from "lib/base-styles";


export const PriceCompare = () => {
  const [invert, setInvert] = useState(false);
  const { fromToken, toToken } = useSwapStore((s) => ({
    fromToken: s.fromToken,
    toToken: s.toToken,
  }));
  const { data: fromTokenUsd } = useUSDPriceQuery(fromToken?.address);
  const { data: toTokenUsd } = useUSDPriceQuery(toToken?.address);

  const leftToken = invert ? toToken : fromToken;
  const rightToken = invert ? fromToken : toToken;

  const leftSideTokenUsd = invert ? toTokenUsd : fromTokenUsd;
  const rightSideTokenUsd = invert ? fromTokenUsd : toTokenUsd;

  const toAmount = useMemo(() => {
    if (!leftSideTokenUsd || !rightSideTokenUsd) return 0;
    return leftSideTokenUsd / rightSideTokenUsd;
  }, [leftSideTokenUsd, rightSideTokenUsd]);

  const rightTokenUsdAmount = useMemo(() => {
    if (!rightSideTokenUsd) return 0;
    return rightSideTokenUsd * toAmount;
  }, [rightSideTokenUsd, toAmount]);

  const _toAmount = useFormatNumber({ value: toAmount });
  const _rightTokenUsdAmount = useFormatNumber({ value: rightTokenUsdAmount });

  const onInvert = (e: any) => {
    e.stopPropagation();
    setInvert(!invert);
  };



  return (
    <StyledPriceCompare>
      <StyledPriceCompareBtn onClick={onInvert}>
        <Text>
          1 {leftToken?.symbol} = {_toAmount} {rightToken?.symbol}{" "}
          <span> {`($${_rightTokenUsdAmount})`}</span>
        </Text>
      </StyledPriceCompareBtn>
    </StyledPriceCompare>
  );
};




const StyledPriceCompareBtn = styled(FlexRow)`
background: transparent;
  p {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textSecondary};
    span {
      font-size: 12px;
      opacity: 0.5;
    }
  }
`;
const StyledPriceCompare = styled(FlexRow)`
cursor: pointer;
justify-content: space-between;
`;
