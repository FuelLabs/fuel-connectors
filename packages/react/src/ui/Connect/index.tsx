import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

import { Routes, useConnectUI } from '../../providers/FuelUIProvider';

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

import type { FuelConnector } from 'fuels';
import { getThemeVariables } from '../../constants/themes';
import { Bridge } from './components/Bridge/Bridge';
import { Connecting } from './components/Connector/Connecting';
import { ExternalDisclaimer } from './components/ExternalDisclaimer/ExternalDisclaimer';

const ConnectRoutes = ({
  state,
  connector,
  theme,
  bridgeURL,
}: {
  theme: string;
  state: Routes;
  bridgeURL?: string;
  connector?: FuelConnector | null;
}) => {
  switch (state) {
    case Routes.INSTALL:
      if (!connector) return <Connectors />;
      return <Connector connector={connector} theme={theme} />;
    case Routes.CONNECTING:
      if (!connector) return <Connectors />;
      return <Connecting connector={connector} theme={theme} />;
    case Routes.EXTERNAL_DISCLAIMER:
      if (!connector) return <Connectors />;
      return <ExternalDisclaimer connector={connector} />;
    case Routes.BRIDGE:
      return <Bridge theme={theme} bridgeURL={bridgeURL} />;
    default:
      return null;
  }
};

export function Connect() {
  // Fix hydration problem between nextjs render and frontend render
  // UI was not getting updated and theme colors was set wrongly
  // see more here https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);
  const {
    theme,
    cancel,
    bridgeURL,
    dialog: { isOpen, route: state, connector, back },
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
                <ConnectRoutes
                  state={state}
                  connector={connector}
                  bridgeURL={bridgeURL}
                  theme={theme}
                />
              </DialogMain>
            </DialogContent>
          </FuelRoot>
        </DialogOverlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
