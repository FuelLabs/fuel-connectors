import { Inset, Popover, Separator, VStack, shortAddress } from '@fuels/ui';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useCurrentConnector,
  useDisconnect,
  useIsConnected,
} from '../../hooks';
import { Anchor, Footer, Header, ScrollableContent } from './components';
import { useAssetsBalance } from './hooks';
import { Overlay } from './styles';
import type { IAssetsBalance } from './types';

import '@fuels/ui/styles.css';
import './index.css';

export const WebWallet = () => {
  const [address, setAddress] = useState('');
  const [mainAsset, setMainAsset] = useState({} as IAssetsBalance);
  const [hideAmount, setHideAmount] = useState(false);
  const [isFetchedBalance, setFetchedBalance] = useState(false);

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
    currentConnector: connector,
    isFetched: isFetchedConnector,
    refetch,
  } = useCurrentConnector();

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

  const isLoading =
    !isFetchedAccount ||
    !isFetchedAssetsBalance ||
    !isFetchedConnector ||
    !isFetchedBalance;

  // Fixes an issue where the Tooltip would be the focused element
  const preventAutoFocus = (e: Event) => {
    e.preventDefault();
  };

  if (!isConnected) {
    return null;
  }
  return (
    <Overlay>
      <Popover>
        <Popover.Trigger>
          <Anchor
            address={shortAddress(address)}
            isLoading={isLoading}
            isConnected={isConnected}
          />
        </Popover.Trigger>
        <Popover.Content sticky="partial" onOpenAutoFocus={preventAutoFocus}>
          <VStack gap="3" className="h-full">
            <Header address={address} title={connector?.name} />
            <Inset side="x">
              <Separator size="4" />
            </Inset>

            <ScrollableContent
              assetsBalances={assetsBalance}
              hideAmount={hideAmount}
              mainAsset={mainAsset}
              toggleHideAmount={toggleHideAmount}
            />
            <Inset side="x" mt="auto">
              <Separator size="4" />
            </Inset>

            <Popover.Close>
              <Footer address={address} disconnect={disconnect} />
            </Popover.Close>
          </VStack>
        </Popover.Content>
      </Popover>
    </Overlay>
  );
};
