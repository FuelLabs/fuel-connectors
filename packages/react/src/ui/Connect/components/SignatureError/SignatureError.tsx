import * as Dialog from '@radix-ui/react-dialog';
import { ErrorIcon } from '../../../../icons/ErrorIcon';
import { useConnectUI } from '../../../../providers/FuelUIProvider';
import {
  BackIcon,
  CloseIcon,
  DialogHeader,
  DialogMain,
  DialogTitle,
  Divider,
} from '../../styles';
import {
  ConnectorButton,
  ConnectorButtonPrimary,
  ConnectorContent,
  ConnectorDescription,
  ConnectorImage,
  ConnectorTitle,
} from '../Connector/styles';
import { DialogContent } from '../Core/DialogContent';
import { DialogFuel } from '../Core/DialogFuel';

type SignatureErrorProps = {
  theme: 'dark' | 'light';
};

export function SignatureError({ theme }: SignatureErrorProps) {
  const { cancel } = useConnectUI();

  return (
    <DialogFuel open={true} theme={theme} onOpenChange={() => cancel()}>
      <DialogContent data-connector={true}>
        <DialogHeader>
          <BackIcon size={32} data-connector={false} />
          <DialogTitle>Signature Error</DialogTitle>
          <Dialog.Close asChild>
            <CloseIcon size={32} onClick={() => cancel()} />
          </Dialog.Close>
        </DialogHeader>
        <Divider />
        <DialogMain>
          <div>
            <ConnectorImage>
              <ErrorIcon size={100} theme={theme} />
            </ConnectorImage>
            <ConnectorContent>
              <ConnectorTitle>Failed to Sign Message</ConnectorTitle>
              <ConnectorDescription>
                If you are using a Ledger device, please check the
                troubleshooting guide below.
              </ConnectorDescription>
            </ConnectorContent>
            <ConnectorButtonPrimary
              href="https://docs.fuel.network/guides/fuel-connectors/solana-ledger-connection"
              target="_blank"
            >
              View Troubleshooting Guide
            </ConnectorButtonPrimary>
            <ConnectorButton onClick={() => cancel()}>Close</ConnectorButton>
          </div>
        </DialogMain>
      </DialogContent>
    </DialogFuel>
  );
}
