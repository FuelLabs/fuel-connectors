import type {
  PredicateConfig,
  PredicateConnector,
} from '@fuel-connectors/common';
import type { AppKit } from '@reown/appkit';
import type {
  ConnectorEvent,
  Provider as FuelProvider,
  StorageAbstract,
} from 'fuels';

export type ReownConnectorConfig = {
  fuelProvider?: FuelProvider;
  appkit: AppKit;
  predicateConfig?: PredicateConfig;
  storage?: StorageAbstract;
  chainId?: number;
};

export interface CustomCurrentConnectorEvent extends ConnectorEvent {
  metadata: {
    pendingSignature: boolean;
  };
}
