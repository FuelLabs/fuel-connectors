import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

import {
  CloseIcon,
  DialogContent,
  DialogMain,
  DialogOverlay,
  DialogTitle,
  Divider,
  FuelRoot,
} from './styles';

import { NATIVE_CONNECTORS } from '../../config';
import { getThemeVariables } from '../../constants/themes';
import { useWallet } from '../../hooks';
import { useFuel, useFuelChain } from '../../providers';
import { NetworkSwitchDialog } from './components/NetworkSwitchDialog';

export function NetworkMonitor({
  theme,
}: {
  theme: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { fuel } = useFuel();
  const { wallet } = useWallet();
  const { chainId } = useFuelChain();
  const walletChainId = wallet?.provider.getChainId();

  const currentConnector = fuel.currentConnector();
  // Fix hydration problem between nextjs render and frontend render
  // UI was not getting updated and theme colors was set wrongly
  // see more here https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);
  const validConnector =
    !!currentConnector &&
    NATIVE_CONNECTORS.includes(currentConnector?.name) &&
    currentConnector.connected;

  const handleOpenChange = (openState: boolean) => {
    if (
      !openState &&
      validConnector &&
      walletChainId != null &&
      walletChainId !== chainId
    ) {
      currentConnector?.disconnect();
    }
    setIsOpen(openState);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (validConnector && walletChainId != null && walletChainId !== chainId) {
      setIsOpen(true);
    }
  }, [chainId, walletChainId, validConnector]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <DialogOverlay asChild>
          <FuelRoot
            style={
              isClient
                ? {
                    display: isOpen ? 'block' : 'none',
                    ...getThemeVariables(theme),
                  }
                : undefined
            }
          >
            <DialogContent data-connector={!!currentConnector}>
              <DialogTitle>Network Switch</DialogTitle>
              <Divider />
              <Dialog.Close asChild>
                <CloseIcon size={32} />
              </Dialog.Close>
              <DialogMain>
                <NetworkSwitchDialog
                  name={currentConnector?.name}
                  close={() => setIsOpen(false)}
                />
              </DialogMain>
            </DialogContent>
          </FuelRoot>
        </DialogOverlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
