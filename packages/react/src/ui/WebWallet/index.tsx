import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

import { Footer, Header, Scrollable } from './components';
import { useWebWallet } from './hooks';
import {
  DialogClose,
  DialogContent,
  DialogMain,
  DialogOverlay,
  DialogTrigger,
  Divider,
  FuelRoot,
} from './styles';

import './index.css';
import { useConnectUI } from '../../providers/FuelUIProvider';
import { shortAddress } from '../../utils';
import { CloseIcon } from '../Connect/styles';
import { getThemeVariables } from '../Connect/themes';

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
  }, []);

  if (!isConnected) {
    return null;
  }

  const handleOpenChange = (openState: boolean) => {
    setOpen(openState);
    console.log('openState', openState);
  };

  const toggleHideAmount = () => {
    setHideAmount(!hideAmount);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        style={
          isClient
            ? {
                display: 'block',
                ...getThemeVariables(theme),
              }
            : undefined
        }
      >
        {!!(isConnected && address) && shortAddress(address)}
      </DialogTrigger>
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
            {currentConnector && (
              <DialogContent>
                <DialogClose>
                  <CloseIcon size={32} onClick={() => setOpen(false)} />
                </DialogClose>
                <DialogMain>
                  <Header
                    address={address}
                    currentConnector={currentConnector}
                  />
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
            )}
          </FuelRoot>
        </DialogOverlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
