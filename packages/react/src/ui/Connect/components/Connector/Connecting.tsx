import type { FuelConnector } from 'fuels';

import { useConnectUI } from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../ConnectorIcon';

import { Spinner } from '../Spinner/Spinner';
import {
  ConnectorButton,
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
        ) : (
          <ConnectorDescription>
            Requesting connection to <br /> {connector.name}.
          </ConnectorDescription>
        )}
      </ConnectorContent>
      <ConnectorButton onClick={retryConnect}>
        {isConnecting ? (
          <Spinner size={26} color="var(--fuel-loader-background)" />
        ) : (
          'Connect'
        )}
      </ConnectorButton>
    </div>
  );
}
