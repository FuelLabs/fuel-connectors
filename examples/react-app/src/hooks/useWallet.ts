import {
  useAccount,
  useBalance,
  useConnect,
  useConnectUI,
  useCurrentConnector,
  useWallet as useFuelWallet,
} from '@fuels/react';
import { useEffect } from 'react';
import { useAccount as useWagmiAccount } from 'wagmi';
import { getConnectorLogo } from '../utils/getConnectorInfo';

export const useWallet = () => {
  const { isConnected: isWagmiConnected } = useWagmiAccount();
  const { connect } = useConnect();
  const {
    isConnected: isFuelConnected,
    isConnecting,
    isLoading: isLoadingConnectors,
  } = useConnectUI();

  const { currentConnector: _currentConnector } = useCurrentConnector();

  // When Wagmi connects via Capsule, connect Fuel
  useEffect(() => {
    console.log('=== Wallet Connection State ===');
    console.log('Wagmi Connected:', isWagmiConnected);
    console.log('Fuel Connected:', isFuelConnected);
    console.log('Fuel Connecting:', isConnecting);
    console.log('Current Connector:', _currentConnector?.name);
    console.log('============================');

    if (isWagmiConnected && !isFuelConnected) {
      console.log('Attempting to connect Fuel with Capsule connector');
      connect('capsule');
    }
  }, [
    isWagmiConnected,
    isFuelConnected,
    isConnecting,
    connect,
    _currentConnector,
  ]);

  const connectImage = _currentConnector
    ? getConnectorLogo(_currentConnector)
    : '';
  const currentConnector = {
    logo: connectImage,
    name: _currentConnector?.name ?? 'Wallet Demo',
  };
  const {
    account,
    isLoading: isLoadingAccount,
    isFetching: isFetchingAccount,
  } = useAccount();
  const {
    balance,
    isLoading: isLoadingBalance,
    isFetching: isFetchingBalance,
    refetch: refetchBalance,
  } = useBalance({
    account,
    query: {
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
    },
  });
  const { wallet } = useFuelWallet({ account });
  const isLoading = [isLoadingAccount, isLoadingBalance].some(Boolean);
  const isFetching = [isFetchingAccount, isFetchingBalance].some(Boolean);

  return {
    account,
    balance,
    currentConnector,
    isConnected: isFuelConnected,
    isConnecting,
    isLoading,
    isFetching,
    isLoadingConnectors,
    wallet,
    refetchBalance,
  };
};
