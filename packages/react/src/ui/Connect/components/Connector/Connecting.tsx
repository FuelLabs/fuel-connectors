import type { FuelConnector } from 'fuels';

import { useConnectUI } from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../ConnectorIcon';

import { Spinner } from '../Spinner/Spinner';
import {
  ConnectorButtonPrimary,
  ConnectorContent,
  ConnectorDescription,
  ConnectorDescriptionError,
  ConnectorImage,
  ConnectorTitle,
} from './styles';

type ConnectorProps = {
  theme?: string;
  className?: string;
  connector: FuelConnector;
};

export function Connecting({ className, connector, theme }: ConnectorProps) {
  const {
    error,
    isConnecting,
    dialog: { retryConnect },
  } = useConnectUI();

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
      <ConnectorButtonPrimary onClick={retryConnect}>
        {isConnecting ? (
          <Spinner size={26} color="var(--fuel-loader-background)" />
        ) : (
          'Connect'
        )}
      </ConnectorButtonPrimary>
    </div>
  );
}
