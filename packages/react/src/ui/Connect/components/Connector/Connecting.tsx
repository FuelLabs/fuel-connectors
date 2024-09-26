import { Routes, useConnectUI } from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../Core/ConnectorIcon';

import { useQuery } from '@tanstack/react-query';
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

  if (!connector) return null;

  useQuery({
    queryKey: ['CONNECTING', connector.name, route, isConnected, isConnecting],
    queryFn: async () => {
      if (isConnected && route === Routes.CONNECTING && !isConnecting) {
        cancel();
      }
      return null;
    },
  });

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
            Click on the button bellow to connect to {location.origin}.
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
