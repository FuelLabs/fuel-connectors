import type { FuelConnector } from 'fuels';
import { useMemo } from 'react';
import { BadgeInfo, BadgeSuccess } from './styles';

interface ConnectorBadgeProps {
  name: FuelConnector['name'];
  connected: FuelConnector['connected'];
  installed: FuelConnector['installed'];
}

// We don't want to show the INSTALLED badge for these connectors
// Because we don't know exactly if externally they are installed or not
// These, for example, are using WalletConnect as a provider
export const BADGE_BLACKLIST = ['Ethereum Wallets', 'Solana Wallets'];

export function ConnectorBadge({
  name,
  connected,
  installed,
}: ConnectorBadgeProps) {
  const isBlacklisted = useMemo<boolean>(() => {
    return BADGE_BLACKLIST.includes(name);
  }, [name]);

  if (connected) {
    return <BadgeSuccess>Connected</BadgeSuccess>;
  }

  if (!isBlacklisted && installed) {
    return <BadgeInfo>Installed</BadgeInfo>;
  }

  return null;
}
