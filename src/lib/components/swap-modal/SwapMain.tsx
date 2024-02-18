import { StepComponent } from "./Step";
import styled, { CSSObject } from "styled-components";
import { SwapDetails } from "./Details";
import { useSteps } from "lib/hooks/useSteps";
import { PoweredByOrbs } from "../PoweredByOrbs";
import { FlexColumn } from "lib/base-styles";
import { SkeletonLoader } from "../SkeletonLoader";
import { Button } from "../Button";
import { useSwapConfirmationButton } from "lib/hooks/useSwapConfirmation";

export const SwapMain = ({ style = {} }: { style?: CSSObject}) => {
  return (
    <Container style={style}>
      <SwapDetails />
      <StepsComponent />
      <PoweredByOrbs />
    </Container>
  );
};

const StepsComponent = () => {
  const { steps, isLoading: stepsLoading } = useSteps();

  if (stepsLoading) {
    return (
      <StyledLoader>
        <StyledSkeleton />
        <StyledSkeleton />

      </StyledLoader>
    );
  }

  return (
    <>
      <StyledSteps $gap={15} style={{ width: "100%" }}>
        <Divider className="lh-steps-divider" />
        {steps.map((step) => {
          return <StepComponent key={step.id} step={step} />;
        })}
      </StyledSteps>
      <SubmitButton />
    </>
  );
};

const StyledLoader = styled(FlexColumn)`
width: 100%;
`

const StyledSkeleton = styled(SkeletonLoader)``

const SubmitButton = () => {
  const { text, onClick, isPending } = useSwapConfirmationButton();

  if (isPending) return null;
  return <StyledSubmit onClick={onClick} className='lh-submit'>{text}</StyledSubmit>;
};


const Container = styled(FlexColumn)`
  width: 100%;
`;

const StyledSubmit = styled(Button)`
  width: 100%;
  margin-top: 20px;
`;

const Divider = styled.div`
  width: 2.5px;
  height: calc(100% - 50px);
  background-color: black;
  left: 12px;
  position: absolute;
  top: 40px;
`;

const StyledSteps = styled(FlexColumn)`
  margin-top: 35px;
  border-top: 1px solid ${(props) => props.theme.colors.divider};
  padding-top: 25px;
  position: relative;
  background-color: ${(props) => props.theme.colors.onyx};
`;
