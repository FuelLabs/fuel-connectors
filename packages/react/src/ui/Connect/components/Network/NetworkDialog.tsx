import { useQuery } from '@tanstack/react-query';
import { Provider } from 'fuels';
import {
  useCurrentConnector,
  useDisconnect,
  useIsConnected,
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
  const { data: chainName } = useQuery({
    queryKey: ['chainName', networks[0]],
    queryFn: async () => {
      if (networks[0].url) {
        const provider = new Provider(networks[0].url);
        return (await provider.getChain()).name;
      }
      return '';
    },
    placeholderData: '',
  });

  function handleSwitch() {
    if (networks[0].chainId == null) return;
    selectNetwork({ chainId: networks[0].chainId, url: networks[0].url });
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
