/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useRef } from "react";
import styled from "styled-components";
import { eqIgnoreCase } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { Token } from "lib/type";
import { Logo } from "../Logo";
import { StyledListToken } from "./styles";
import { Text } from "../Text";
import { useWidgetStore } from "../../store";
import { useSortedTokens, useTokenBalance, useUsdAmount } from "lib/hooks";
import { useIsIntersacting } from "lib/hooks/useIsIntersacting";
import { QUERY_KEYS } from "lib/consts";
import {
  useContractCallback,
  useFormatNumber,
} from "@orbs-network/liquidity-hub-ui";
import { FlexColumn, FlexRow } from "lib/base-styles";

const filterTokens = (list: Token[], filterValue: string) => {
  if (!filterValue) return list;

    if(!list) return [];

  return list.filter((it) => {
    return (
      it.symbol.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0 ||
      it.address.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0
    );
  });
};

const Row = ({
  token,
  onSelect,
}: {
  token: Token;
  onSelect: (token: Token) => void;
}) => {  
  const { address } = token;
  const ref = useRef<any>();
  const isIntersacting = useIsIntersacting(ref);
  const balance = useTokenBalance(address);
  const usd = useUsdAmount({
    address,
    amount: balance,
    disabled: !isIntersacting,
  });
  const _balance = useFormatNumber({ value: balance, decimalScale: 4 });
  const _usd = useFormatNumber({ value: usd, decimalScale: 4 });
  const { fromToken, toToken } = useWidgetStore((store) => {
    return {
      fromToken: store.fromToken,
      toToken: store.toToken,
    };
  });

  const disabled =
    eqIgnoreCase(address, fromToken?.address || "") ||
    eqIgnoreCase(address, toToken?.address || "");

  return (
    <StyledListToken
      onClick={() => onSelect(token)}
      $disabled={disabled}
      ref={ref}
    >
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
            <StyledTokenName className="name">{token.name}</StyledTokenName>
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
        <StyledUSD className="usd">${_usd}</StyledUSD>
      </FlexColumn>
    </StyledListToken>
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
  const { sortedTokens , dateUpdatedAt } = useSortedTokens();
  
  const getContract = useContractCallback();

  const filteredTokens = useMemo(() => {
    const result = filterTokens(sortedTokens || [], addressOrSymbol || "");
    if (!addressOrSymbol) {
      return result;
    }
    if (_.size(result)) {
      return result;
    }
    return undefined;
  }, [addressOrSymbol, dateUpdatedAt]);

  const query = useQuery<Token[]>({
    queryKey: [QUERY_KEYS.FILTER_TOKENS, addressOrSymbol],
    queryFn: async () => {
      const result = filterTokens(sortedTokens || [], addressOrSymbol || "");
      if (!addressOrSymbol) {
        return result;
      }
      if (_.size(result)) {
        return result;
      }
      const tokenContract = getContract(addressOrSymbol);
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
    enabled: !filteredTokens && !!addressOrSymbol,
  });

  return {
    filteredTokens: filteredTokens || query.data,
    isLoading: query.isLoading,
  };
};

export function TokenList({
  onTokenSelected,
  filterValue,
  isFromToken,
}: {
  onTokenSelected: () => void;
  filterValue?: string;
  isFromToken?: boolean;
}) {
  const { filteredTokens } = useFilterTokens(filterValue);
  const { onToTokenChange, onFromTokenChange } = useWidgetStore((s) => ({
    onToTokenChange: s.onToTokenChange,
    onFromTokenChange: s.onFromTokenChange,
  }));

  const onSelect = useCallback(
    (token: Token) => {
      if (isFromToken) {
        onFromTokenChange(token);
      } else {
        onToTokenChange(token);
      }
      onTokenSelected();
    },
    [onToTokenChange, onFromTokenChange, onTokenSelected, isFromToken]
  );

  return (
    <StyledContent>
      {filteredTokens?.map((it) => {
        return <Row onSelect={onSelect} token={it} key={it.address} />;
      })}
    </StyledContent>
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
  overflowY: "auto",
});

export const StyledTokensList = styled.div`
  flex: 1;
  display: flex;
  overflow: auto;
  width: 100%;
  padding-top: 10px;
`;
