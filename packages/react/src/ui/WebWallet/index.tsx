import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

import { Footer, Header, Scrollable } from './components';
import { useWebWallet } from './hooks';
import {
  CloseIcon,
  Container,
  DialogClose,
  DialogContent,
  DialogMain,
  DialogTrigger,
  Divider,
  FuelRoot,
  VisuallyHidden,
} from './styles';

import './index.css';
import { IconWallet } from '@tabler/icons-react';
import { getThemeVariables } from '../../constants/themes';
import { useConnectUI } from '../../providers/FuelUIProvider';
import { shortAddress } from '../../utils';

export const WebWallet = () => {
  const {
    isOpen,
    setOpen,
    address,
    mainAsset,
    hideAmount,
    setHideAmount,
    isConnected,
    currentConnector,
    assetsBalance,
    disconnect,
  } = useWebWallet();
  // Fix hydration problem between nextjs render and frontend render
  // UI was not getting updated and theme colors was set wrongly
  // see more here https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);
  const { theme } = useConnectUI();

  useEffect(() => {
    setIsClient(true);

    // Fix for Radix-UI Dialog disabling pointer events for the whole page
    // see more here: https://github.com/radix-ui/primitives/issues/2122
    document.styleSheets[0].insertRule(
      'body { pointer-events: auto !important; }',
      document.styleSheets[0].cssRules.length,
    );
  }, []);

  const handleOpenChange = (openState: boolean) => {
    // Fix for dialog not opening on mobile
    // We're debouncing the open state to the next tick
    setTimeout(() => setOpen(openState), 0);
  };

  const toggleHideAmount = () => {
    setHideAmount(!hideAmount);
  };

  if (!isClient) return null;

  const style = {
    display: !isConnected ? 'none' : 'block',
    ...getThemeVariables(theme),
  } as React.CSSProperties;

  return (
    <FuelRoot style={style}>
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger>
          <Container $align="center" $gap="4px">
            <IconWallet size={20} />
            <span>{!!(isConnected && address) && shortAddress(address)}</span>
          </Container>
        </DialogTrigger>

        <DialogContent
          forceMount
          style={{
            visibility: isOpen ? 'visible' : 'hidden',
          }}
        >
          <DialogMain>
            <VisuallyHidden>
              <Dialog.DialogTitle />
              <Dialog.Description />
            </VisuallyHidden>
            <Container>
              <Header address={address} currentConnector={currentConnector} />
              <DialogClose asChild>
                <CloseIcon size={32} onClick={() => setOpen(false)} />
              </DialogClose>
            </Container>
            <Divider />
            <Scrollable
              assetsBalances={assetsBalance}
              hideAmount={hideAmount}
              mainAsset={mainAsset}
              toggleHideAmount={toggleHideAmount}
            />
            <Divider />
            <Footer address={address} disconnect={disconnect} />
          </DialogMain>
        </DialogContent>
      </Dialog.Root>
    </FuelRoot>
  );
};
