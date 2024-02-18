import { useFormatNumber } from "lib/hooks/useFormatNumber";
import styled, { CSSProperties } from "styled-components";
import { SkeletonLoader } from "./SkeletonLoader";
import { Text } from "./Text";

interface Props {
  value?: string;
  className?: string;
  css?: CSSProperties;
  isLoading?: boolean;
}

export function Balance({ value, className = "", css = {}, isLoading }: Props) {
  const balance = useFormatNumber({ value });

  return (
    <Container className={`clob-balance ${className}`} style={css}>
      {isLoading ? <SkeletonLoader /> : <Text> {`Balance: ${balance}`}</Text>}
    </Container>
  );
}

const Container = styled.div`
  font-size: 14px;
`;
