/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import styled from "styled-components";
import { TokenSearchInput } from "./SearchInput";
import { Modal } from "@orbs-network/liquidity-hub-lib";
import _ from "lodash";
import { TokenList } from "../TokenList";

export function TokenModal({
  open,
  onClose,
  isFromToken,
}: {
  open: boolean;
  onClose: () => void;
  isFromToken?: boolean;
}) {
  const [filterValue, setFilterValue] = useState("");


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

        <TokenList
          filterValue={filterValue}
          isFromToken={isFromToken}
          onTokenSelected={onClose}
        />
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
`;

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
