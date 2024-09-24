import type { FuelConnector } from 'fuels';
import { useMemo } from 'react';
import { NATIVE_CONNECTORS } from '../../../../config';
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
  OrLabel,
  Title,
} from './styles';

export function NetworkSwitchDialog({
  currentConnector,
  close,
}: { currentConnector: FuelConnector | undefined | null; close: () => void }) {
  const { chainId } = useFuelChain();
  const { selectNetwork, isError, error, isPending } = useSelectNetwork();
  const canSwitch = useMemo(
    () =>
      currentConnector?.name &&
      NATIVE_CONNECTORS.includes(currentConnector?.name),
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

  const description = `${currentConnector?.name ?? 'Your wallet'}'s network does not match the target for this
  project.${canSwitch ? ' Switch to the correct network or disconnect.' : ''}`;

  function onClick() {
    chainId != null && selectNetwork({ chainId }, { onSuccess: close });
  }
  return (
    <Container>
      <Title>Network Switch Required</Title>
      <Description>{description}</Description>
      {!!isError ||
        (!canSwitch && <ErrorMessage>{getErrorMessage()}</ErrorMessage>)}
      {!isPending && (
        <Button
          type="button"
          disabled={isPending || chainId == null || !canSwitch}
          onClick={onClick}
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
        onClick={currentConnector?.disconnect}
        value="Disconnect"
        color="var(--fuel-border-color)"
      />
    </Container>
  );
}
