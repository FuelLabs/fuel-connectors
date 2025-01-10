import { Routes, useConnectUI } from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../Core/ConnectorIcon';

import type { ConnectorEvent } from 'fuels';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '../../../../icons/Spinner';
import { useFuel } from '../../../../providers/FuelHooksProvider';
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
    dialog: { route, connector, retryConnect },
    isConnected,
  } = useConnectUI();

  const [connectStep, setConnectStep] = useState<ConnectStep>(
    ConnectStep.CONNECT,
  );

  const { description, cta } = useMemo(() => {
    if (connectStep === ConnectStep.CONNECT) {
      return {
        description: `Click on the button below to connect to ${location.origin}.`,
        cta: 'Connect',
      };
    }

    return {
      description:
        'Sign this message to prove you own this wallet and proceed. Canceling will disconnect you.',
      cta: 'Sign',
    };
  }, [connectStep]);

  // Auto-close connecting
  useEffect(() => {
    if (isConnected && route === Routes.CONNECTING && !isConnecting) {
      cancel();
    }
  }, [isConnected, route, isConnecting, cancel]);

  // Switching to signing ownership mode
  useEffect(() => {
    const onCurrentConnectorChange = (e: CustomCurrentConnectorEvent) => {
      if (e.metadata?.pendingSignature) {
        setConnectStep(ConnectStep.SIGN);
      }
    };

    fuel.on(fuel.events.currentConnector, onCurrentConnectorChange);

    return () => {
      fuel.off(fuel.events.currentConnector, onCurrentConnectorChange);
    };
  }, [fuel]);

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
          <ConnectorDescription>{description}</ConnectorDescription>
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
