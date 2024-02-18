import { FlexColumn, FlexRow } from "lib/base-styles";
import { useChainConfig } from "lib/hooks/useChainConfig";
import { useSwapConfirmation } from "lib/hooks/useSwapConfirmation";
import { useSwapState } from "lib/store/main";
import { Token } from "lib/type";
import { Check, ArrowRight, Link } from "react-feather";
import styled from "styled-components";
import { Logo } from "../Logo";
import { Text } from "../Text";

export const SwapSuccess = () => {
  return (
    <StyledSuccess>
      <StyledSuccessLogo>
        <Check />
      </StyledSuccessLogo>
      <SuccessText>Swap success</SuccessText>
      <FlexRow>
        <FromToken />
        <StyledArrow />
        <ToToken />
      </FlexRow>
      <TXLink />
    </StyledSuccess>
  );
};

const TXLink = () => {
  const txHash = useSwapState((store) => store.txHash);
  const explorerUrl = useChainConfig()?.explorerUrl;

  return (
    <StyledLink target="_blank" href={`${explorerUrl}/tx/${txHash}`}>
      View on explorer
    </StyledLink>
  );
};

const StyledLink = styled(Link)`
  margin-top: 20px;
`;

const StyledArrow = styled(ArrowRight)`
  width: 20px;
  color: white;
  height: 20px;
`;

const StyledLogo = styled(Logo)`
  width: 24px;
  height: 24px;
`;

const StyledTokenText = styled(Text)`
  font-size: 15px;
`;

const SuccessToken = ({
  token,
  amount,
}: {
  token?: Token;
  amount?: string;
}) => {
  return (
    <FlexRow>
      <StyledLogo src={token?.logoUrl} />
      <StyledTokenText>
        {amount} {token?.symbol}
      </StyledTokenText>
    </FlexRow>
  );
};

const FromToken = () => {
  const { fromToken, fromAmountUI } = useSwapConfirmation();

  return <SuccessToken token={fromToken} amount={fromAmountUI} />;
};

const ToToken = () => {
  const { toToken, toAmountUI } = useSwapConfirmation();

  return <SuccessToken token={toToken} amount={toAmountUI} />;
};

const SuccessText = styled(Text)`
  font-size: 20px;
`;

const StyledSuccess = styled(FlexColumn)`
  width: 100%;
  align-items: center;
  gap: 20px;
`;

const StyledSuccessLogo = styled(FlexRow)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #4caf50;
  align-items: center;
  justify-content: center;
  svg {
    width: 60%;
    height: 60%;
    color: white;
  }
`;
