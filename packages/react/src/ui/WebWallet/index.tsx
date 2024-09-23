import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useCurrentConnector,
  useDisconnect,
  useIsConnected,
} from '../../hooks';
import { Footer, Header, Scrollable } from './components';
import { useAssetsBalance, useWebWallet } from './hooks';
import {
  DialogClose,
  DialogContent,
  DialogMain,
  DialogOverlay,
  DialogTrigger,
  Divider,
  FuelRoot,
} from './styles';
import type { IAssetsBalance } from './types';

import './index.css';
import { useConnectUI } from '../../providers/FuelUIProvider';
import { shortAddress } from '../../utils';
import { CloseIcon } from '../Connect/styles';
import { getThemeVariables } from '../Connect/themes';

export const WebWallet = () => {
  const { isOpen, setOpen } = useWebWallet();
  // Fix hydration problem between nextjs render and frontend render
  // UI was not getting updated and theme colors was set wrongly
  // see more here https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);

  const [address, setAddress] = useState('');
  const [mainAsset, setMainAsset] = useState({} as IAssetsBalance);
  const [hideAmount, setHideAmount] = useState(false);
  const [isFetchedBalance, setFetchedBalance] = useState(false);

  const { theme } = useConnectUI();
  const { isConnected } = useIsConnected();
  const { disconnect } = useDisconnect();
  const {
    account,
    isFetched: isFetchedAccount,
    refetch: refetchAccount,
  } = useAccount();

  const {
    assetsBalance,
    isFetched: isFetchedAssetsBalance,
    refetch: refetchAssetsBalance,
  } = useAssetsBalance();

  const {
    currentConnector,
    isFetched: isFetchedConnector,
    refetch,
  } = useCurrentConnector();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleHideAmount = () => {
    setHideAmount(!hideAmount);
  };

  useEffect(() => {
    if (!isConnected) {
      setAddress('');
      setMainAsset({} as IAssetsBalance);
      setFetchedBalance(false);
    } else {
      refetch();
      refetchAccount();
      refetchAssetsBalance();
      setFetchedBalance(false);
    }
  }, [isConnected, refetch, refetchAccount, refetchAssetsBalance]);

  useEffect(() => {
    if (assetsBalance.length > 0 && !isFetchedBalance) {
      const asset =
        assetsBalance.find((ab) => ab.symbol === 'ETH') ?? assetsBalance[0];
      setMainAsset(asset);
      setFetchedBalance(true);
    }
  }, [assetsBalance, isFetchedBalance]);

  useEffect(() => {
    if (isFetchedAccount && account && address === '') {
      setAddress(account);
    }
  }, [account, isFetchedAccount, address]);

  const _isLoading =
    !isFetchedAccount ||
    !isFetchedAssetsBalance ||
    !isFetchedConnector ||
    !isFetchedBalance;

  if (!isConnected) {
    return null;
  }

  const handleOpenChange = (openState: boolean) => {
    setOpen(openState);
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
