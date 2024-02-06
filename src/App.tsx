import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { WidgetUISettings } from "lib";
import { RainbowProvider } from "RainbowProvider";
import { useMemo } from "react";
import { useAccount, useConfig, useNetwork } from "wagmi";
import { Widget } from "./lib/widget/Widget";
import styled from "styled-components";
export const useProvider = () => {
  const { data } = useConfig();

  return useMemo(() => {
    return (data as any)?.provider;
  }, [data]);
};

const uiConfig: WidgetUISettings = {
  config: {
    percentButtons: [
      { label: "25%", value: 0.25 },
      { label: "50%", value: 0.5 },
      { label: "75%", value: 0.75 },
      { label: "100%", value: 1 },
    ],
  },
};

function Wrapped() {
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();
  const provider = useProvider();
  const connectedChainId = useNetwork().chain?.id;

  return (
    <Widget
      provider={provider}
      onConnect={openConnectModal}
      connectedChainId={connectedChainId}
      partner="playground"
      address={address}
      partnerChainId={56}
      uiSettings={uiConfig}
    />
  );
}

export const App = () => {
  return (
    <RainbowProvider>
      <Container>
        <ConnectButton />
        <Wrapped />
      </Container>
    </RainbowProvider>
  );
};


const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  gap: 20px;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`