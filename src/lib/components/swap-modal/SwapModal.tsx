/* eslint-disable import/no-extraneous-dependencies */

import { SwapMain } from "./SwapMain";
import { SwapSuccess } from "./SwapSuccess";
import styled from "styled-components";
import { SwapFailed } from "./SwapFailed";
import { useMemo } from "react";
import { useSwapState } from "lib/store/main";
import { Modal } from "../Modal";

export function SwapModal() {
  const { swapStatus, onCloseSwap, showWizard } = useSwapState((store) => ({
    swapStatus: store.swapStatus,
    onCloseSwap: store.onCloseSwap,
    showWizard: store.showWizard,
  }));

  const modalTitle = useMemo(() => {
    if (swapStatus === "success") {
      return "Swap completed";
    }
    if (swapStatus === "failed") {
      return "";
    }
    return "Review swap";
  }, [swapStatus]);

  return (
    <Modal
      title={modalTitle}
      open={showWizard}
      onClose={onCloseSwap}
      contentStyles={{
        maxWidth: "420px",
        background:'black',
      }}
    >
      <Container className="lh-swap-modal-content">
        {swapStatus === "success" ? (
          <SwapSuccess />
        ) : swapStatus === "failed" ? (
          <SwapFailed />
        ) : (
          <SwapMain />
        )}
      </Container>
    </Modal>
  );
}

const Container = styled.div`
  width: 100%;
  * {
    box-sizing: border-box;
  }
`;
