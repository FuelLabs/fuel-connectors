import { useQueryClient } from '@tanstack/react-query';
import type { FuelConfig } from 'fuels';
import { useEffect } from 'react';

import { QUERY_KEYS } from '../utils';

import { useFuel } from './FuelHooksProvider';

export function FuelEventsWatcher({ fuelConfig }: { fuelConfig?: FuelConfig }) {
  const { fuel } = useFuel();
  const queryClient = useQueryClient();

  function onCurrentConnectorChange() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.isConnected() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.balance() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.provider() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nodeInfo() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentConnector() });
  }

  function onConnectorsChange() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.connectorList() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentConnector() });
  }

  function onCurrentAccountChange() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.balance() });
  }

  function onConnectionChange() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.isConnected() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.balance() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.provider() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nodeInfo() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.connectorList() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentConnector() });
  }

  function onNetworkChange() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentNetwork() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.networks() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.provider() });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.transactionReceipts(),
    });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chain() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nodeInfo() });
  }

  function onAccountsChange() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts() });
  }

  function onAssetsChange() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assets() });
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: We don't need to add all the dependencies here
  useEffect(() => {
    fuel.on(fuel.events.currentAccount, onCurrentAccountChange);
    fuel.on(fuel.events.currentConnector, onCurrentConnectorChange);
    fuel.on(fuel.events.connectors, onConnectorsChange);
    fuel.on(fuel.events.connection, onConnectionChange);
    fuel.on(fuel.events.accounts, onAccountsChange);
    fuel.on(fuel.events.currentNetwork, onNetworkChange);
    fuel.on(fuel.events.assets, onAssetsChange);

    return () => {
      fuel.off(fuel.events.currentConnector, onCurrentConnectorChange);
      fuel.off(fuel.events.currentAccount, onCurrentAccountChange);
      fuel.off(fuel.events.connectors, onConnectorsChange);
      fuel.off(fuel.events.connection, onConnectionChange);
      fuel.off(fuel.events.accounts, onAccountsChange);
      fuel.off(fuel.events.currentNetwork, onNetworkChange);
      fuel.off(fuel.events.assets, onAssetsChange);
    };
  }, [fuel, queryClient]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We don't need to add all the dependencies here
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.connectorList() });
  }, [fuelConfig?.connectors, queryClient]);

  return null;
}
