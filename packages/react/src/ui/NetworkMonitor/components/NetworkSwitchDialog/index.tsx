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
  name,
  close,
}: { name: string | undefined; close: () => void }) {
  const { chainId } = useFuelChain();
  const { selectNetwork, isError, error, isPending } = useSelectNetwork();

  const description = isError
    ? error?.message || 'Failed to switch network'
    : `${name ?? 'Your wallet'}'s network does not match the target for this
  project.`;

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
        <Description error={isError}>{description}</Description>
      </Content>
      {!isPending && (
        <Button
          type="button"
          disabled={isPending || chainId == null}
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
