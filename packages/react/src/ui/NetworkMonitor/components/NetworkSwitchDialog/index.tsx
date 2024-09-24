import type { FuelConnector } from 'fuels';
import { useMemo } from 'react';
import { NATIVE_CONNECTORS } from '../../../../config';
import { useSelectNetwork } from '../../../../hooks/useSelectNetwork';
import { CloseIcon } from '../../../../icons/CloseIcon';
import { Spinner } from '../../../../icons/Spinner';
import { useFuelChain } from '../../../../providers';
import {
  Button,
  ButtonLoading,
  Container,
  Content,
  Description,
  IconContainer,
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

  function getDescription() {
    if (isError) {
      return error?.message || 'Failed to switch network';
    }
    return `${currentConnector?.name ?? 'Your wallet'}'s network does not match the target for this
  project.${
    canSwitch
      ? ' Switch to disconnect or close this dialog to disconnect.'
      : ' This connector does not support switching networks.'
  }`;
  }

  function onClick() {
    chainId != null && selectNetwork({ chainId }, { onSuccess: close });
  }
  return (
    <Container>
      <IconContainer>
        <CloseIcon size={100} color="var(--fuel-color-error)" />
      </IconContainer>
      <Content>
        <Title>Network Switch Required</Title>
        <Description error={isError}>{getDescription()}</Description>
      </Content>
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
    </Container>
  );
}
