import {
  useAccounts,
  useConnectUI,
  useConnectors,
  useIsConnected,
  useWallet as useFuelWallet,
  useBalance
} from '@fuel-wallet/react';
import { useEffect, useState } from 'react';

interface ICurrentConnector {
  logo: string;
  title: string;
}

export const useWallet = () => {
  const { connect, isConnecting } = useConnectUI();
  const { isConnected, refetch: refetchConnected } = useIsConnected();
  const {
    accounts,
    isLoading: isLoadingAccounts,
    isFetching: isFetchingAccounts
  } = useAccounts();
  const {
    data,
    isLoading: isLoadingConnectors,
    isFetching: isFetchingConnectors
  } = useConnectors();

  const address = accounts[0];

  const { wallet, refetch: refetchWallet } = useFuelWallet(address);
  const {
    balance,
    isLoading: isLoadingBalance,
    isFetching: isFetchingBalance
  } = useBalance({ address });

  const [currentConnector, setCurrentConnector] = useState<ICurrentConnector>({
    logo: './Fuel_Logo_White_RGB.svg',
    title: 'Fuel Wallet Demo'
  });

  useEffect(() => {
    refetchConnected();
  }, [isConnected]);

  useEffect(() => {
    const connector = data.find(
      (connectorData) => connectorData.connected === true
    );

    let logo =
      typeof connector?.metadata.image === 'string'
        ? connector?.metadata.image
        : connector?.metadata.image?.dark ?? './Fuel_Logo_White_RGB.svg';

    const title = connector?.name ?? 'Fuel Wallet';

    setCurrentConnector({ logo, title });
  }, [data, isConnected]);

  const isLoading = [
    isLoadingAccounts,
    isLoadingConnectors,
    isLoadingBalance
  ].some(Boolean);

  const isFetching = [
    isFetchingAccounts,
    isFetchingConnectors,
    isFetchingBalance
  ].some(Boolean);

  return {
    address,
    accounts,
    balance,
    currentConnector,
    isConnected,
    isConnecting,
    isLoading,
    isFetching,
    wallet,
    connect,
    refetchConnected,
    refetchWallet
  };
};
