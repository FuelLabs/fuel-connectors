import type { FuelConnector } from 'fuels';
import { BadgeInfo, BadgeSuccess } from './styles';

interface ConnectorBadgeProps {
  connected: FuelConnector['connected'];
  installed: FuelConnector['installed'];
}

export function ConnectorBadge({ connected, installed }: ConnectorBadgeProps) {
  if (connected) {
    return <BadgeSuccess>Connected</BadgeSuccess>;
  }
  if (installed) {
    return <BadgeInfo>Installed</BadgeInfo>;
  }

  return null;
}
