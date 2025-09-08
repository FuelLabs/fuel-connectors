import type { FuelConnector } from 'fuels';
import { NATIVE_CONNECTORS } from '../config';

export function isNativeConnector(connector: FuelConnector) {
  return NATIVE_CONNECTORS.includes(connector?.name);
}
