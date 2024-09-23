import type { FuelConnector } from 'fuels';
import { useMemo } from 'react';
import { NATIVE_CONNECTORS } from '../../../../config';
import { BadgeInfo, BadgeSuccess } from './styles';

interface ConnectorBadgeProps {
  name: FuelConnector['name'];
  connected: FuelConnector['connected'];
  installed: FuelConnector['installed'];
}

export function ConnectorBadge({
  name,
  connected,
  installed,
}: ConnectorBadgeProps) {
  const isBlacklisted = useMemo<boolean>(() => {
    return !NATIVE_CONNECTORS.includes(name);
  }, [name]);

  if (connected) {
    return <BadgeSuccess>Connected</BadgeSuccess>;
  }

  if (!isBlacklisted && installed) {
    return <BadgeInfo>Installed</BadgeInfo>;
  }

  return null;
}
