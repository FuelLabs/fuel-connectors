import { Routes, useConnectUI } from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../Core/ConnectorIcon';

import { useEffect } from 'react';
import { Spinner } from '../../../../icons/Spinner';
import {
  ConnectorButton,
  ConnectorButtonPrimary,
  ConnectorContent,
  ConnectorDescription,
  ConnectorDescriptionError,
  ConnectorImage,
  ConnectorTitle,
} from './styles';

type ConnectorProps = {
  className?: string;
};

export function Connecting({ className }: ConnectorProps) {
  const {
    error,
    isConnecting,
    theme,
    cancel,
    dialog: { route, connector, retryConnect },
    isConnected,
  } = useConnectUI();

  useEffect(() => {
    if (isConnected && route === Routes.CONNECTING && !isConnecting) {
      cancel();
    }
  }, [isConnected, route, isConnecting, cancel]);

  if (!connector) return null;

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
        {error ? (
          <ConnectorDescriptionError>{error.message}</ConnectorDescriptionError>
        ) : isConnecting ? (
          <ConnectorDescription>
            Requesting connection to <br /> {connector.name}.
          </ConnectorDescription>
        ) : (
          <ConnectorDescription>
            Click on the button below to connect to {location.origin}.
          </ConnectorDescription>
        )}
      </ConnectorContent>
      {isConnecting ? (
        <ConnectorButton>
          <Spinner size={26} color="var(--fuel-loader-background)" />
        </ConnectorButton>
      ) : (
        <ConnectorButtonPrimary onClick={() => retryConnect(connector)}>
          Connect
        </ConnectorButtonPrimary>
      )}
    </div>
  );
}
