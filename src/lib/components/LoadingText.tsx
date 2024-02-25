import {
  SkeletonLoader,
} from "@orbs-network/liquidity-hub-ui";
import styled, { CSSProperties } from "styled-components";
import { Text } from "./Text";

interface Props {
  value?: string;
  className?: string;
  css?: CSSProperties;
  isLoading?: boolean;
}

export function LoadingText({ value, className = "", css = {}, isLoading }: Props) {

  return (
    <Container className={`lh-loading-text ${className}`} style={css}>
      {isLoading ? (
        <SkeletonLoader
          styles={{
            width: "30px",
            height: "10px",
            borderRadius: "5px",
            opacity: 0.5,
          }}
        />
      ) : (
        <StyledText> {value}</StyledText>
      )}
    </Container>
  );
}

const StyledText = styled(Text)`
    font-size: inherit;
    color: inherit;
    font-weight: inherit;
`

const Container = styled.div`
  font-size: 14px;
`;
