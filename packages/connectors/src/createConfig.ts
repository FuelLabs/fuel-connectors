import type { PredicateConnector } from '@fuel-connectors/common';
import type { FuelConfig, FuelConnector } from 'fuels';

export function createConfig(func: () => FuelConfig) {
  if (typeof window === 'undefined')
    return {
      connectors: [],
    };
  return func();
}

export function hasSignMessageCustomCurve(
  connector?: FuelConnector | PredicateConnector | null,
): connector is PredicateConnector {
  if (!connector) return false;
  return (connector as PredicateConnector).signMessageCustomCurve !== undefined;
}
