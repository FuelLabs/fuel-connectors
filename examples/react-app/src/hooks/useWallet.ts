import {
  useAccount,
  useBalance,
  useConnectUI,
  useCurrentConnector,
  useWallet as useFuelWallet,
  useIsConnected,
} from '@fuels/react';
import { getConnectorLogo } from '../utils/getConnectorInfo';

export const useWallet = () => {
  const {
    connect,
    isConnecting,
    isLoading: isLoadingConnectors,
  } = useConnectUI();
  const { connector } = useCurrentConnector();
  const connectImage = connector ? getConnectorLogo(connector) : '';
  const currentConnector = {
    logo: connectImage,
    name: connector?.name ?? 'Wallet Demo',
  };
  const { isConnected } = useIsConnected();
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
  } = useBalance(
    { account },
    {
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
    },
  );
  const { wallet } = useFuelWallet(account);
  const isLoading = [isLoadingAccount, isLoadingBalance].some(Boolean);
  const isFetching = [isFetchingAccount, isFetchingBalance].some(Boolean);

  return {
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
    refetchBalance,
  };
};
