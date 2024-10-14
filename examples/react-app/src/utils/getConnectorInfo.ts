import type { FuelConnector } from 'fuels';

export function getConnectorLogo(connector: FuelConnector) {
  return connector && typeof connector.metadata?.image === 'object'
    ? connector.metadata.image.dark ?? ''
    : (connector?.metadata?.image as string) ?? '';
}
