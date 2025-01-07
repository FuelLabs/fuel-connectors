import { ConnectorIcon } from '../Core/ConnectorIcon';

import { Spinner } from '../../../../icons/Spinner';
import { useConnectUI } from '../../../../providers/FuelUIProvider';
import {
  ConnectorButton,
  ConnectorButtonPrimary,
  ConnectorContent,
  ConnectorDescription,
  ConnectorDescriptionError,
  ConnectorImage,
  ConnectorTitle,
} from '../Connector/styles';

export function PreSignatureDialog() {
  const {
    error,
    isConnecting,
    theme,
    cancel,
    dialog: { connector },
  } = useConnectUI();

  if (!connector) return null;

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
        {error ? (
          <ConnectorDescriptionError>{error.message}</ConnectorDescriptionError>
        ) : isConnecting ? (
          <ConnectorDescription>
            Requesting signature to <br /> {connector.name}.
          </ConnectorDescription>
        ) : (
          <ConnectorDescription>
            Sign this message to prove you own this wallet and proceed.
            <br />
            Canceling will disconnect you.
          </ConnectorDescription>
        )}
      </ConnectorContent>
      {/* @TODO: Add Cancel Styles */}
      <ConnectorButtonPrimary onClick={() => cancel()}>
        Cancel
      </ConnectorButtonPrimary>
      {isConnecting ? (
        <ConnectorButton>
          <Spinner size={26} color="var(--fuel-loader-background)" />
        </ConnectorButton>
      ) : (
        <ConnectorButtonPrimary onClick={() => alert(connector)}>
          Sign
        </ConnectorButtonPrimary>
      )}
    </div>
  );
}
