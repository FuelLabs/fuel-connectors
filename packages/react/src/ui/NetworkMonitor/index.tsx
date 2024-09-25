import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useMemo, useState } from 'react';

import { isNativeConnector } from 'src/utils';
import { NATIVE_CONNECTORS } from '../../config';
import { getThemeVariables } from '../../constants/themes';
import {
  useCurrentConnector,
  useIsConnected,
  useProvider,
  useWallet,
} from '../../hooks';
import { useFuel, useFuelChain } from '../../providers';
import { DialogContent } from '../Dialog/components/Content';
import { NetworkSwitchDialog } from './components/NetworkSwitchDialog';
import { DialogMain, DialogOverlay, FuelRoot } from './styles';

export function NetworkMonitor({
  theme,
}: {
  theme: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { chainId } = useFuelChain();
  const { provider } = useProvider();
  const { connector: currentConnector } = useCurrentConnector();
  const { isConnected } = useIsConnected();

  useEffect(() => {
    if (!isConnected) return;
    if (chainId === undefined) return;
    if (!provider) return;
    setIsOpen(provider.getChainId() !== chainId);
  }, [provider, chainId, isConnected]);

  // const currentConnector = fuel.currentConnector();
  // Fix hydration problem between nextjs render and frontend render
  // UI was not getting updated and theme colors was set wrongly
  // see more here https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Dialog.Root open={isOpen}>
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
                <NetworkSwitchDialog close={() => setIsOpen(false)} />
              </DialogMain>
            </DialogContent>
          </FuelRoot>
        </DialogOverlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
