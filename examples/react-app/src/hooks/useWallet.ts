import {
  useAccount,
  useBalance,
  useConnectUI,
  useFuel,
  useWallet as useFuelWallet,
  useIsConnected,
} from '@fuels/react';
import { useEffect, useState } from 'react';

interface ICurrentConnector {
  logo: string;
  title: string;
}

const DEFAULT_CONNECTOR: ICurrentConnector = {
  logo: '',
  title: 'Wallet Demo',
};

export const useWallet = () => {
  const { fuel } = useFuel();
  const {
    connect,
    isConnecting,
    isLoading: isLoadingConnectors,
  } = useConnectUI();
  const { isConnected } = useIsConnected();
  const {
    account,
    isLoading: isLoadingAccount,
    isFetching: isFetchingAccount,
  } = useAccount();

  const address = account ?? '';

  const { wallet, refetch: refetchWallet } = useFuelWallet(address);

  const {
    balance,
    isLoading: isLoadingBalance,
    isFetching: isFetchingBalance,
  } = useBalance(
    { address },
    {
      refetchOnWindowFocus: true,
      refetchInterval: 10000,
    },
  );
  const [currentConnector, setCurrentConnector] =
    useState<ICurrentConnector>(DEFAULT_CONNECTOR);

  useEffect(() => {
    if (!isConnected) {
      setCurrentConnector(DEFAULT_CONNECTOR);
      return;
    }

    const currentConnector = fuel.currentConnector();

    const title = currentConnector?.name ?? DEFAULT_CONNECTOR.title;

    const logo =
      currentConnector && typeof currentConnector.metadata?.image === 'object'
        ? currentConnector.metadata.image.dark ?? ''
        : (currentConnector?.metadata?.image as string) ?? '';

    setCurrentConnector({ logo, title });
  }, [fuel.currentConnector, isConnected]);

  const isLoading = [isLoadingAccount, isLoadingBalance].some(Boolean);

  const isFetching = [isFetchingAccount, isFetchingBalance].some(Boolean);

  return {
    address,
    account,
    balance,
    currentConnector,
    isConnected,
    isConnecting,
    isLoading,
    isFetching,
    isLoadingConnectors,
    wallet,
    connect,
    refetchWallet,
  };
};
