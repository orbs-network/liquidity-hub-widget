/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import {
  useTokenAmountUSD,
  useGetTokensQuery,
  useTokenContract,
} from "../../hooks";
import { useSwapStore } from "../../store";
import { Logo } from "../Logo";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { Token } from "../../type";
import { StyledListToken } from "./styles";
import { eqIgnoreCase, TokenData } from "@defi.org/web3-candies";
import { TokenSearchInput } from "./SearchInput";
import { Text } from "../Text";
import { Modal, useFormatNumber } from "@orbs-network/liquidity-hub-lib";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { FlexRow, FlexColumn } from "lib/base-styles";

const filterTokens = (list: Token[], filterValue: string) => {
  if (!filterValue) return list;

  return list.filter((it) => {
    return (
      it.symbol.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0 ||
      it.address.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0
    );
  });
};

const Row = (props: any) => {
  const { index, style, data } = props;
  const token: Token = data.tokens[index];
  const usd = useTokenAmountUSD(token, token.balance);
  const _balance = useFormatNumber({ value: token.balance, decimalScale: 4 });
  const _usd = useFormatNumber({ value: usd, decimalScale: 4, prefix: "$" });
  const { fromToken, toToken } = useSwapStore((store) => {
    return {
      fromToken: store.fromToken,
      toToken: store.toToken,
    };
  });

  const onSelect = useCallback(() => {
    data.onTokenSelect(token);
    data.onClose();
  }, [data, token]);

  if (!token) return null;

  const disabled =
    eqIgnoreCase(token.address, fromToken?.address || "") ||
    eqIgnoreCase(token.address, toToken?.address || "");
  return (
    <div style={style}>
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
            src={token.logoUrl}
            alt={token.symbol}
            imgStyle={{
              width: 30,
              height: 30,
            }}
          />
          <FlexColumn style={{ alignItems: "flex-start" }}>
            <Text>{token.symbol}</Text>
            {token.name && <StyledTokenName>{token.name}</StyledTokenName>}
          </FlexColumn>
        </FlexRow>
        <FlexColumn
          style={{
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          <StyledBalance>{_balance}</StyledBalance>
          <StyledUSD>{_usd}</StyledUSD>
        </FlexColumn>
      </StyledListToken>
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

export function TokenModal({
  open,
  onClose,
  onTokenSelect,
}: {
  open: boolean;
  onClose: () => void;
  onTokenSelect: (token: any) => void;
}) {
  const [filterValue, setFilterValue] = useState("");

  const { data: filteredTokens } = useFilterTokens(filterValue);

  const itemData = useMemo(() => {
    return { tokens: filteredTokens, onClose, onTokenSelect };
  }, [filteredTokens, onClose, onTokenSelect]);

  return (
    <Modal
      onClose={onClose}
      open={open}
      title={"Select a token"}
      contentStyles={{ padding: "0px", maxWidth: 500 }}
    >
      <StyledContent>
        <SearchInputContainer>
          <StyledSearchInput setValue={setFilterValue} value={filterValue} />
        </SearchInputContainer>

        <AutoSizer>
          {({ height, width }: any) => (
            <List
              overscanCount={5}
              className="List"
              itemData={itemData}
              height={height || 0}
              itemCount={_.size(filteredTokens)}
              itemSize={60}
              width={width || 0}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </StyledContent>
    </Modal>
  );
}

const StyledSearchInput = styled(TokenSearchInput)`
  width: 100%;
  height: 40px;
  
`;

const SearchInputContainer = styled.div`
  width: 100%;
  padding: 0px 20px;
`

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
