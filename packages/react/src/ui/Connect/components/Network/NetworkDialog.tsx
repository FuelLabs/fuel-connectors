import { CHAIN_IDS, Provider } from 'fuels';
import { useState } from 'react';
import {
  useChain,
  useCurrentConnector,
  useDisconnect,
  useIsConnected,
  useNodeInfo,
  useSelectNetwork,
} from '../../../../hooks';
import { useIsSupportedNetwork } from '../../../../hooks/useIsSupportedNetwork';
import { Spinner } from '../../../../icons/Spinner';
import { useFuel } from '../../../../providers';
import { DialogContent } from '../Core/DialogContent';
import { DialogFuel } from '../Core/DialogFuel';
import {
  Button,
  ButtonDisconnect,
  ButtonLoading,
  Container,
  Description,
  DialogMain,
  Divider,
  ErrorMessage,
  Header,
  MiddleDescription,
  OrLabel,
  Title,
} from './styles';

export function NetworkDialog({
  theme,
}: {
  theme: 'dark' | 'light';
}) {
  const { networks } = useFuel();
  const { disconnect } = useDisconnect();
  const { currentConnector } = useCurrentConnector();
  const { isSupportedNetwork } = useIsSupportedNetwork();
  const { selectNetwork, isError, error, isPending } = useSelectNetwork();
  const { isConnected } = useIsConnected();
  const [chainName, setChainName] = useState('');

  function handleSwitch() {
    if (networks[0].chainId == null) return;
    selectNetwork({ chainId: networks[0].chainId });
  }

  function handleDisconnect() {
    disconnect();
  }

  function getErrorMessage() {
    if (
      isError &&
      (error?.message === 'Method not implemented.' ||
        error?.message === 'Method not found')
    ) {
      return 'The selected Wallet does not support switching networks, please switch manually in your wallet.';
    }
    if (isError) {
      return error?.message || 'Failed to switch network';
    }
    return '';
  }

  if (networks == null || !isConnected) {
    return null;
  }

  if (networks[0].url) {
    Provider.create(networks[0].url).then((provider) => {
      const chainName = provider.getChain().name;
      setChainName(chainName);
    });
  }
  return (
    <DialogFuel open={!isSupportedNetwork && !!chainName} theme={theme}>
      <DialogContent
        data-connector={!!currentConnector}
        // Disable closing when clicking outside the dialog
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        // Disable closing when pressing escape
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogMain>
          <Container>
            <Header>
              <Title>Network Switch Required</Title>
              <Description>
                This app does not support the current connected network.
              </Description>
              {chainName && (
                <>
                  <MiddleDescription>Switch to:</MiddleDescription>
                  <MiddleDescription>
                    <span style={{ fontWeight: 'bold' }}>{chainName}</span>
                  </MiddleDescription>
                </>
              )}
              {!!isError && <ErrorMessage>{getErrorMessage()}</ErrorMessage>}
            </Header>
            {!isPending && (
              <Button
                type="button"
                disabled={isPending}
                onClick={handleSwitch}
                value="Switch Network"
              />
            )}
            {isPending && (
              <ButtonLoading>
                <Spinner size={26} color="var(--fuel-loader-background)" />
              </ButtonLoading>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '6px',
                width: '100%',
              }}
            >
              <Divider />
              <OrLabel>or</OrLabel>
              <Divider />
            </div>
            <ButtonDisconnect
              type="button"
              onClick={handleDisconnect}
              value="Disconnect"
              color="var(--fuel-border-color)"
            />
          </Container>
        </DialogMain>
      </DialogContent>
    </DialogFuel>
  );
}
