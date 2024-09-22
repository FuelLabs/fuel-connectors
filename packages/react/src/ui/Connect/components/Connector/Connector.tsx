import type { FuelConnector } from 'fuels';
import { useEffect, useState } from 'react';

import { useConnectUI } from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../ConnectorIcon';

import { Spinner } from '../Spinner/Spinner';
import {
  ConnectorButton,
  ConnectorContent,
  ConnectorDescription,
  ConnectorImage,
  ConnectorTitle,
} from './styles';

type ConnectorProps = {
  theme?: string;
  className?: string;
  connector: FuelConnector;
};

export function Connector({ className, connector, theme }: ConnectorProps) {
  const {
    install: { action, link, description },
  } = connector.metadata;

  const {
    setError,
    dialog: { connect },
  } = useConnectUI();
  const [isLoading, setLoading] = useState(!connector.installed);

  useEffect(() => {
    const ping = async () => {
      try {
        await connector.ping();
        connector.installed = true;
        connect(connector);
      } catch (error) {
        setLoading(false);
        setError(error as Error);
      }
    };

    ping();
  }, [connector, connect, setError]);

  const actionText = action || 'Install';

  return (
    <div className={className}>
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
      <ConnectorButton href={link} target="_blank" aria-disabled={isLoading}>
        {isLoading ? (
          <Spinner size={26} color="var(--fuel-loader-background)" />
        ) : (
          actionText
        )}
      </ConnectorButton>
    </div>
  );
}
