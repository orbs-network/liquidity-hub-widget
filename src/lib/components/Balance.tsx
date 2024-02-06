import { useFormatNumber } from '@orbs-network/liquidity-hub-lib';
import styled, { CSSProperties } from 'styled-components'
import { useSwapStore } from '../store';
import { SkeletonLoader } from './SkeletonLoader';
import { Text } from './Text';

interface Props{
    value?: string;
    className?: string;
    css?: CSSProperties;
}


export function Balance({ value, className = '', css = {} }: Props) {
  const fetchingBalancesAfterTx = useSwapStore(
    (s) => s.fetchingBalancesAfterTx
  );
    const balance = useFormatNumber({ value });

  return (
    <Container className={`clob-balance ${className}`} style={css}>
      {fetchingBalancesAfterTx ? (
        <SkeletonLoader  />
      ) : (
        <Text> {`Balance: ${balance}`}</Text>
      )}
    </Container>
  );
}



const Container = styled.div`
  font-size: 14px;
`;