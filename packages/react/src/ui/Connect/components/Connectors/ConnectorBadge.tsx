import type { FuelConnector } from 'fuels';
import { useMemo } from 'react';
import { NATIVE_CONNECTORS } from '../../../../config';
import { BadgeInfo, BadgeSuccess } from './styles';

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
    navigator.userAgent,
  );
}

function isFueletWebView() {
  return /FueletMobileApp/i.test(navigator.userAgent);
}

function isFueletConnectorOnMobileBrowser(connectorName: string) {
  return connectorName === 'Fuelet Wallet' && isMobile() && !isFueletWebView();
}

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

  if (!isBlacklisted && installed && !isFueletConnectorOnMobileBrowser(name)) {
    return <BadgeInfo>Installed</BadgeInfo>;
  }

  return null;
}
