import type { PredicateConfig } from '@fuel-connectors/common';
import type { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type {
  ConnectorEvent,
  Provider as FuelProvider,
  StorageAbstract,
} from 'fuels';

export type WalletConnectConfig = {
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  projectId?: string;
  wagmiAdapter?: WagmiAdapter;
  predicateConfig?: PredicateConfig;
  storage?: StorageAbstract;
  chainId?: number;
  // if the dapp already has wagmi from eth connectors, it's better to skip auto reconnection as it can lead to session loss when refreshing the page
  skipAutoReconnect?: boolean;
};

export interface CustomCurrentConnectorEvent extends ConnectorEvent {
  metadata: {
    pendingSignature: boolean;
  };
}
