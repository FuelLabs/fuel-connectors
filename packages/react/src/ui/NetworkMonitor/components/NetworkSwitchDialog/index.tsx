import { useCurrentConnector } from '../../../../hooks/useCurrentConnector';
import { useDisconnect } from '../../../../hooks/useDisconnect';
import { useSelectNetwork } from '../../../../hooks/useSelectNetwork';
import { Spinner } from '../../../../icons/Spinner';
import { useFuelChain } from '../../../../providers';
import {
  Button,
  ButtonDisconnect,
  ButtonLoading,
  Container,
  Description,
  Divider,
  ErrorMessage,
  Header,
  OrLabel,
  Title,
} from './styles';

export function NetworkSwitchDialog({ close }: { close: () => void }) {
  const { connector: currentConnector } = useCurrentConnector();
  const { disconnect } = useDisconnect();
  const { chainId } = useFuelChain();
  const { selectNetwork, isError, error, isPending } = useSelectNetwork();

  if (!currentConnector) {
    return null;
  }

  function getErrorMessage() {
    if (isError && error?.message === 'Method not implemented.') {
      return 'The selected Wallet does not support switching networks, please switch manually in your wallet.';
    }
    if (isError) {
      return error?.message || 'Failed to switch network';
    }
    return '';
  }

  function handleSwitch() {
    chainId != null && selectNetwork({ chainId }, { onSuccess: close });
  }

  function handleDisconnect() {
    disconnect();
    close();
  }

  return (
    <Container>
      <Header>
        <Title>Network Switch Required</Title>
        <Description>
          This app does not support the current connected network. Switch or
          disconnect to continue.
        </Description>
        {!!isError && <ErrorMessage>{getErrorMessage()}</ErrorMessage>}
      </Header>
      {!isPending && (
        <Button
          type="button"
          disabled={isPending || chainId == null}
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
        <Divider style={{ flex: 1 }} />
        <OrLabel>or</OrLabel>
        <Divider style={{ flex: 1 }} />
      </div>
      <ButtonDisconnect
        type="button"
        onClick={handleDisconnect}
        value="Disconnect"
        color="var(--fuel-border-color)"
      />
    </Container>
  );
}
