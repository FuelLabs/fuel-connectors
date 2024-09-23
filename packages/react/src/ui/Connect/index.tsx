import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

import { useConnectUI } from '../../providers/FuelUIProvider';

import { Connector } from './components/Connector/Connector';
import { Connectors } from './components/Connectors';
import {
  BackIcon,
  CloseIcon,
  DialogContent,
  DialogMain,
  DialogOverlay,
  DialogTitle,
  Divider,
  FuelRoot,
} from './styles';
import { getThemeVariables } from './themes';

import './index.css';

export function Connect() {
  // Fix hydration problem between nextjs render and frontend render
  // UI was not getting updated and theme colors was set wrongly
  // see more here https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);
  const {
    theme,
    cancel,
    dialog: { isOpen, connector, back },
  } = useConnectUI();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleOpenChange = (openState: boolean) => {
    if (!openState) cancel();
  };

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
            <DialogContent data-connector={!!connector}>
              <DialogTitle>Connect Wallet</DialogTitle>
              <Divider />
              <Dialog.Close asChild>
                <CloseIcon size={32} />
              </Dialog.Close>
              <BackIcon size={32} onClick={back} data-connector={!!connector} />
              <DialogMain>
                {connector ? (
                  <Connector connector={connector} theme={theme} />
                ) : (
                  <Connectors />
                )}
              </DialogMain>
            </DialogContent>
          </FuelRoot>
        </DialogOverlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
