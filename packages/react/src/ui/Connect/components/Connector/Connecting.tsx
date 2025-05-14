import { Routes, useConnectUI } from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../Core/ConnectorIcon';

import type { ConnectorEvent } from 'fuels';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '../../../../icons/Spinner';
import { useFuel } from '../../../../providers/FuelHooksProvider';
import { isNativeConnector } from '../../../../utils/isNativeConnector';
import { PREDICATE_DISCLAIMER_KEY } from '../PredicateAddressDisclaimer/PredicateAddressDisclaimer';
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

export interface CustomCurrentConnectorEvent extends ConnectorEvent {
  metadata?: {
    pendingSignature: boolean;
  };
}

enum ConnectStep {
  CONNECT = 'connect',
  SIGN = 'sign',
}

export function Connecting({ className }: ConnectorProps) {
  const { fuel } = useFuel();
  const {
    error,
    isConnecting,
    theme,
    cancel,
    dialog: { route, setRoute, connector, retryConnect },
    isConnected,
  } = useConnectUI();

  const [connectStep, setConnectStep] = useState<ConnectStep>(
    ConnectStep.CONNECT,
  );

  const { description, operation, cta } = useMemo(() => {
    if (connectStep === ConnectStep.CONNECT) {
      return {
        description: `Click on the button below to connect to ${location.origin}.`,
        operation: 'connection',
        cta: 'Connect',
      };
    }

    return {
      description:
        'Sign this message to prove you own this wallet and proceed. Canceling will disconnect you.',
      operation: 'signature',
      cta: 'Sign',
    };
  }, [connectStep]);

  // Auto-close connecting
  useEffect(() => {
    if (isConnected && route === Routes.Connecting && !isConnecting) {
      // Connected to a native connector, we can close the dialog
      if (connector && isNativeConnector(connector)) {
        cancel();
        return;
      }

      // If the connector is not native, let's check if we have already displayed the disclaimer
      const supportsPredicateVersions =
        connector &&
        'getAvailablePredicateVersions' in connector &&
        typeof (connector as { getAvailablePredicateVersions?: unknown })
          .getAvailablePredicateVersions === 'function';

      if (supportsPredicateVersions) {
        setRoute(Routes.PredicateVersionSelector);
        return;
      }

      if (localStorage.getItem(PREDICATE_DISCLAIMER_KEY)) {
        cancel();
        return;
      }

      setRoute(Routes.PredicateAddressDisclaimer);
    }
  }, [isConnected, connector, route, setRoute, isConnecting, cancel]);

  // Switching to signing ownership mode
  useEffect(() => {
    const onCurrentConnectorChange = (e: CustomCurrentConnectorEvent) => {
      if (e.metadata && 'pendingSignature' in e.metadata) {
        setConnectStep(
          e.metadata.pendingSignature ? ConnectStep.SIGN : ConnectStep.CONNECT,
        );
      }
    };

    fuel.on(fuel.events.currentConnector, onCurrentConnectorChange);

    return () => {
      fuel.off(fuel.events.currentConnector, onCurrentConnectorChange);
    };
  }, [fuel]);

  useEffect(() => {
    if (error) {
      if (error.message.includes('Failed to sign message')) {
        setRoute(Routes.SignatureError);
      }
    }
  }, [error, setRoute]);

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
        {isConnecting ? (
          <ConnectorDescription>
            Requesting {operation} to <br /> {connector.name}.
          </ConnectorDescription>
        ) : (
          <ConnectorDescription>{description}</ConnectorDescription>
        )}
        {error && (
          <ConnectorDescriptionError>{error.message}</ConnectorDescriptionError>
        )}
      </ConnectorContent>
      {isConnecting ? (
        <ConnectorButton>
          <Spinner size={26} color="var(--fuel-loader-background)" />
        </ConnectorButton>
      ) : (
        <ConnectorButtonPrimary onClick={() => retryConnect(connector)}>
          {cta}
        </ConnectorButtonPrimary>
      )}
    </div>
  );
}
