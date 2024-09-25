import type { FuelConnector } from 'fuels';
import { useMemo } from 'react';
import { NATIVE_CONNECTORS } from '../../../../config';
import { useCurrentConnector } from '../../../../hooks/useCurrentConnector';
import { useDisconnect } from '../../../../hooks/useDisconnect';
import { useSelectNetwork } from '../../../../hooks/useSelectNetwork';
import { Spinner } from '../../../../icons/Spinner';
import { useFuelChain } from '../../../../providers';
import { isNativeConnector } from '../../../../utils';
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
  const canSwitch = useMemo(
    () => currentConnector?.name && isNativeConnector(currentConnector),
    [currentConnector],
  );

  if (!currentConnector) {
    return null;
  }

  function getErrorMessage() {
    if (isError) {
      return error?.message || 'Failed to switch network';
    }
    if (!canSwitch) {
      return 'This connector does not support switching networks.';
    }
    return '';
  }

  const description = `This app does not support the current connected network.${
    canSwitch ? ' Switch or disconnect to continue.' : ''
  }`;

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
        <Description>{description}</Description>
        {(!!isError || !canSwitch) && (
          <ErrorMessage>{getErrorMessage()}</ErrorMessage>
        )}
      </Header>
      {!isPending && (
        <Button
          type="button"
          disabled={isPending || chainId == null || !canSwitch}
          onClick={handleSwitch}
          value="Switch"
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
          gap: '10px',
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
