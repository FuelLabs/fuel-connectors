import { useEffect, useState } from 'react';
import {
  useAccount,
  useCurrentConnector,
  useDisconnect,
  useIsConnected,
} from '../../../hooks';
import { EmptyEthAsset, isEthAsset } from '../../../utils';
import { useAssetsBalance } from './useAssetsBalance';

export type WebWalletProps = {
  account: string;
};
export const useWebWallet = ({ account }: WebWalletProps) => {
  const [isOpen, setOpen] = useState(false);
  const [mainAsset, setMainAsset] = useState(EmptyEthAsset);
  const [hideAmount, setHideAmount] = useState(false);
  const [isFetchedBalance, setFetchedBalance] = useState(false);

  const { isConnected } = useIsConnected();
  const { disconnect } = useDisconnect();
  const { assetsBalance, refetch: refetchAssetsBalance } =
    useAssetsBalance(account);
  const { currentConnector, refetch } = useCurrentConnector();

  useEffect(() => {
    if (!isConnected) {
      setMainAsset(EmptyEthAsset);
      setFetchedBalance(false);
      setOpen(false);
    } else {
      refetch();
      refetchAssetsBalance();
      setFetchedBalance(false);
    }
  }, [isConnected, refetch, refetchAssetsBalance]);

  useEffect(() => {
    if (assetsBalance.length > 0 && !isFetchedBalance) {
      const asset = assetsBalance.find(isEthAsset) ?? EmptyEthAsset;
      setMainAsset(asset);
      setFetchedBalance(true);
    }
  }, [assetsBalance, isFetchedBalance]);

  return {
    isOpen,
    setOpen,
    mainAsset,
    hideAmount,
    setHideAmount,
    isConnected,
    currentConnector,
    assetsBalance,
    disconnect,
    isLoading: !isFetchedBalance || !currentConnector,
  };
};
