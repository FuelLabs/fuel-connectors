import { ConnectorIcon } from '../Core/ConnectorIcon';

import { useEffect } from 'react';
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
  useEffect(() => {
    const ping = async () => {
      const isInstalled = await connector.ping();
      if (isInstalled) setRoute(Routes.Connecting);
    };

    ping();
  }, [connector, setRoute]);

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
        If you have installed it and it is not detected,
        <br />
        try refreshing the page.
      </ConnectorFooterHelper>
    </div>
  );
}
