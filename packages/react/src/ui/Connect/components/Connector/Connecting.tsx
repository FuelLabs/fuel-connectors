import { Routes, useConnectUI } from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../Core/ConnectorIcon';

import type { ConnectorEvent, ConnectorMetadata } from 'fuels';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '../../../../icons/Spinner';
import { useFuel } from '../../../../providers';
import { isNativeConnector } from '../../../../utils/isNativeConnector';
import { PREDICATE_DISCLAIMER_KEY } from '../PredicateAddressDisclaimer/PredicateAddressDisclaimer';
import { ETHEREUM_ICON, SIGNATURE_PENDING_ERROR } from './constants';
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

enum ConnectStep {
  CONNECT = 'connect',
  SIGN = 'sign',
}

export interface CustomCurrentConnectorEvent extends ConnectorEvent {
  metadata: {
    pendingSignature: boolean;
  };
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

  const { name, description, operation, cta, metadata } = useMemo(() => {
    const actualName = connector?.name || 'Unknown';

    if (connectStep === ConnectStep.CONNECT) {
      return {
        name: actualName,
        metadata: connector?.metadata as ConnectorMetadata,
        description: `Click on the button below to connect to ${location.origin}.`,
        operation: 'connection',
        cta: 'Connect',
      };
    }

    return {
      name: actualName,
      metadata: {
        image: ETHEREUM_ICON,
        ...connector?.metadata,
      } as ConnectorMetadata,
      description:
        'Sign this message to prove you own this wallet and proceed. Canceling will disconnect you.',
      operation: 'signature',
      cta: 'Sign',
    };
  }, [connector, connectStep]);

  const disableError = useMemo<boolean>(() => {
    return Boolean(error?.message.includes(SIGNATURE_PENDING_ERROR));
  }, [error]);

  // Auto-close connecting
  useEffect(() => {
    if (isConnected && route === Routes.Connecting) {
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

      // So we need to show the disclaimer about predicates
      setRoute(Routes.PredicateAddressDisclaimer);
    }
  }, [isConnected, connector, route, setRoute, cancel]);

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
          connectorMetadata={metadata}
          connectorName={name}
          size={100}
          theme={theme}
        />
      </ConnectorImage>
      <ConnectorContent>
        <ConnectorTitle>{name}</ConnectorTitle>
        {isConnecting ? (
          <ConnectorDescription>
            Requesting {operation} to <br /> {name}.
          </ConnectorDescription>
        ) : (
          <ConnectorDescription>{description}</ConnectorDescription>
        )}
        {error && !disableError && (
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
