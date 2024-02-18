import { useSubmitButton } from "../hooks";
import styled from "styled-components";
import { Spinner } from "@orbs-network/liquidity-hub-lib";
import { useSharedContext } from "lib/context";
export const SwapSubmitButton = ({
  className = "",
}: {
  className?: string;
}) => {
  const { disabled, text, onClick, isLoading } = useSubmitButton();

  const btnStyles = useSharedContext().uiSettings?.styles?.submitButton;

  return (
    <StyledSubmitButton
      className={`${className} clob-submit-button`}
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
