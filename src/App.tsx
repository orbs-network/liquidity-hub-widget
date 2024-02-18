import { ConnectButton } from "@rainbow-me/rainbowkit";
import { RainbowProvider } from "RainbowProvider";
import { useMemo } from "react";
import { useAccount, useConfig, useNetwork } from "wagmi";
import styled from "styled-components";
import { LiquidityHubProvider } from "lib/provider";
import { supportedChainsConfig, Widget } from "lib";
export const useProvider = () => {
  const { data } = useConfig();

  return useMemo(() => {
    return (data as any)?.provider;
  }, [data]);
};


function Wrapped() {
  const { address } = useAccount();
  const provider = useProvider();
  const connectedChainId = useNetwork().chain?.id;

  return (
    <LiquidityHubProvider
      provider={provider}
      chainId={connectedChainId}
      partner="playground"
      account={address}
      partnerChainId={supportedChainsConfig.polygon.chainId}
    >
      <Widget />
    </LiquidityHubProvider>
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