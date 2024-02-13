/* eslint-disable @typescript-eslint/no-explicit-any */
import { CSSProperties, ReactElement, useCallback, useMemo } from "react";
import styled from "styled-components";

import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";

import { eqIgnoreCase, TokenData } from "@defi.org/web3-candies";
import { useFormatNumber } from "@orbs-network/liquidity-hub-lib";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { FlexRow, FlexColumn } from "lib/base-styles";
import { Token } from "lib/type";
import {
  useTokenAmountUSD,
  useGetTokensQuery,
  useTokenContract,
} from "lib/hooks";
import { useSwapStore } from "lib/store";
import { Logo } from "./Logo";
import { StyledListToken } from "./TokenSelectModal/styles";
import { Text } from "./Text";

const filterTokens = (list: Token[], filterValue: string) => {
  if (!filterValue) return list;

  return list.filter((it) => {
    return (
      it.symbol.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0 ||
      it.address.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0
    );
  });
};

const Row = ({
  index,
  style,
  data,
}: {
  index: number;
  style: CSSProperties;
  data: any;
}) => {
  const token: Token = data.tokens[index];
  const usd = useTokenAmountUSD(token.address, token.balance);
  const _balance = useFormatNumber({ value: token.balance, decimalScale: 4 });
  const _usd = useFormatNumber({ value: usd, decimalScale: 4, prefix: "$" });
  const { fromTokenAddress, toTokenAddress } = useSwapStore((store) => {
    return {
      fromTokenAddress: store.fromTokenAddress,
      toTokenAddress: store.toTokenAddress,
    };
  });

  const onSelect = useCallback(() => {
    data.onSelect(token.address);
  }, [data.onSelect, token]);

  if (!token) return null;

  const disabled =
    eqIgnoreCase(token.address, fromTokenAddress || "") ||
    eqIgnoreCase(token.address, toTokenAddress || "");

  return (
    <div style={style}>
      <>
        {data.renderItem ? (
          data.renderItem({
            token,
            balance: _balance,
            usd: _usd,
            onSelect,
          })
        ) : (
          <StyledListToken onClick={onSelect} $disabled={disabled}>
            <FlexRow
              style={{
                width: "unset",
                flex: 1,
                justifyContent: "flex-start",
                gap: 10,
              }}
            >
              <Logo
                className="logo"
                src={token.logoUrl}
                alt={token.symbol}
                imgStyle={{
                  width: 30,
                  height: 30,
                }}
              />
              <FlexColumn style={{ alignItems: "flex-start" }}>
                <Text className="symbol">{token.symbol}</Text>
                {token.name && (
                  <StyledTokenName className="name">
                    {token.name}
                  </StyledTokenName>
                )}
              </FlexColumn>
            </FlexRow>
            <FlexColumn
              style={{
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              <StyledBalance className="balance">{_balance}</StyledBalance>
              <StyledUSD className="usd">{_usd}</StyledUSD>
            </FlexColumn>
          </StyledListToken>
        )}
      </>
    </div>
  );
};

const StyledTokenName = styled(Text)`
  font-size: 12px;
  opacity: 0.8;
`;

const StyledBalance = styled(Text)`
  font-size: 14px;
`;

const StyledUSD = styled(Text)`
  font-size: 12px;
  opacity: 0.8;
`;

const useFilterTokens = (addressOrSymbol?: string) => {
  const { data: tokens = [] } = useGetTokensQuery();

  const tokenContract = useTokenContract(addressOrSymbol);
  return useQuery<TokenData[]>({
    queryKey: ["useFindToken", addressOrSymbol, _.size(tokens)],
    queryFn: async () => {
      const result = filterTokens(tokens, addressOrSymbol || "");
      if (!addressOrSymbol) {
        return result;
      }
      if (_.size(result)) {
        return result;
      }
      if (!tokenContract) {
        return [];
      }

      const [symbol, decimals, name] = await Promise.all([
        tokenContract?.methods.symbol().call(),
        tokenContract?.methods.decimals().call(),
        tokenContract?.methods.name().call(),
      ]);

      return [
        {
          symbol,
          decimals,
          name,
          address: addressOrSymbol,
          custom: true,
        },
      ];
    },
  });
};

export function TokenList({
  onTokenSelected,
  filterValue,
  itemSize,
  renderItem,
  isFromToken,
}: {
  onTokenSelected: () => void;
  filterValue?: string;
  itemSize?: number;
  isFromToken?: boolean;
  renderItem?: ({
    token,
    balance,
    usd,
  }: {
    token: Token;
    balance: string;
    usd: string;
  }) => ReactElement;
}) {
  const { data: filteredTokens } = useFilterTokens(filterValue);
  const { onToTokenChange, onFromTokenChange } = useSwapStore((s) => ({
    onToTokenChange: s.onToTokenChange,
    onFromTokenChange: s.onFromTokenChange,
  }));

  const onSelect = useCallback(
    (address: string) => {
      if (isFromToken) {
        onFromTokenChange(address);
      } else {
        onToTokenChange(address);
      }
      onTokenSelected();
    },
    [onToTokenChange, onFromTokenChange, onTokenSelected, isFromToken]
  );

  const itemData = useMemo(() => {
    return { tokens: filteredTokens, onSelect, renderItem };
  }, [filteredTokens, onSelect, renderItem]);

  return (
    <AutoSizer>
      {({ height, width }: any) => (
        <List
          overscanCount={5}
          className="List"
          itemData={itemData}
          height={height || 0}
          itemCount={_.size(filteredTokens)}
          itemSize={itemSize || 60}
          width={width || 0}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
}

export const StyledContent = styled.div({
  display: "flex",
  flexDirection: "column",
  maxHeight: "90vh",
  height: "700px",
  padding: 0,
  width: "100%",
  margin: 0,
  overflow: "hidden",
  color: "white",
});

export const StyledTokensList = styled.div`
  flex: 1;
  display: flex;
  overflow: auto;
  width: 100%;
  padding-top: 10px;
`;
