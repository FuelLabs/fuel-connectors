import type { FuelConnector } from 'fuels';

import { ConnectorIcon } from '../Core/ConnectorIcon';

import { useQuery } from '@tanstack/react-query';
import { useConnectUI } from '../../../../providers';
import { Routes } from '../../../../providers/FuelUIProvider';
import {
  ConnectorButtonPrimary,
  ConnectorContent,
  ConnectorDescription,
  ConnectorFooterHelper,
  ConnectorImage,
  ConnectorTitle,
} from './styles';

export function Connector() {
  const {
    theme,
    dialog: { connector, setRoute },
  } = useConnectUI();
  if (!connector) return null;
  const {
    install: { action, link, description },
  } = connector.metadata;

  // Ping extension: if it's installed, it will trigger connector
  useQuery({
    queryKey: ['CONNECTOR_PING', connector.name, connector.installed],
    queryFn: async () => {
      const isInstall = await connector.ping();
      if (isInstall) setRoute(Routes.CONNECTING);
      return isInstall;
    },
    staleTime: Number.POSITIVE_INFINITY,
  });

  const actionText = action || 'Install';

  return (
    <div>
      <ConnectorImage>
        <ConnectorIcon
          connectorMetadata={connector.metadata}
          connectorName={connector.name}
          size={100}
          theme={theme}
        />
      </ConnectorImage>
      <ConnectorContent>
        <ConnectorTitle>{connector.name}</ConnectorTitle>
        <ConnectorDescription>{description}</ConnectorDescription>
      </ConnectorContent>
      <ConnectorButtonPrimary href={link} target="_blank">
        {actionText}
      </ConnectorButtonPrimary>
      <ConnectorFooterHelper>
        If you have install and is not detected <br /> try to refresh the page.
      </ConnectorFooterHelper>
    </div>
  );
}
