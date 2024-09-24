import { useEffect, useState } from 'react';
import {
  useAccount,
  useCurrentConnector,
  useDisconnect,
  useIsConnected,
} from '../../../hooks';
import { EmptyEthAsset, type IAssetsBalance, isEthAsset } from '../../../utils';
import { useAssetsBalance } from './useAssetsBalance';

export const useWebWallet = () => {
  const [isOpen, setOpen] = useState(false);
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

  const { assetsBalance, refetch: refetchAssetsBalance } = useAssetsBalance();

  const { currentConnector, refetch } = useCurrentConnector();

  useEffect(() => {
    if (!isConnected) {
      setAddress('');
      setMainAsset(EmptyEthAsset);
      setFetchedBalance(false);
      setOpen(false);
    } else {
      refetch();
      refetchAccount();
      refetchAssetsBalance();
      setFetchedBalance(false);
    }
  }, [isConnected, refetch, refetchAccount, refetchAssetsBalance]);

  useEffect(() => {
    if (assetsBalance.length > 0 && !isFetchedBalance) {
      const asset = assetsBalance.find(isEthAsset) ?? EmptyEthAsset;
      setMainAsset(asset);
      setFetchedBalance(true);
    }
  }, [assetsBalance, isFetchedBalance]);

  useEffect(() => {
    if (isFetchedAccount && account && address === '') {
      setAddress(account);
    }
  }, [account, isFetchedAccount, address]);

  return {
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
    isLoading: !isFetchedBalance || !isFetchedAccount || !currentConnector,
  };
};
