import { Routes, useConnectUI } from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../Core/ConnectorIcon';

import type { ConnectorMetadata } from 'fuels';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '../../../../icons/Spinner';
import { isNativeConnector } from '../../../../utils/isNativeConnector';
import { PREDICATE_DISCLAIMER_KEY } from '../PredicateAddressDisclaimer/PredicateAddressDisclaimer';
import {
  ETHEREUM_ICON,
  REOWN_APPKIT_CONNECTION_STATUS,
  SIGNATURE_PENDING_ERROR,
} from './constants';
import { REOWN_APPKIT_NAMESPACE } from './constants';
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

export function Connecting({ className }: ConnectorProps) {
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

    const getCustomData = () => {
      const appkit = window.localStorage.getItem(
        REOWN_APPKIT_CONNECTION_STATUS,
      );
      const namespace = window.localStorage.getItem(REOWN_APPKIT_NAMESPACE);
      const isAppkitConnected = appkit === 'connected';
      const isSolanaNamespace = namespace === 'solana';

      if (isAppkitConnected) {
        return {
          customName: isSolanaNamespace ? 'Solana Wallets' : 'Ethereum Wallets',
          customMetadata: isSolanaNamespace
            ? (connector?.metadata as ConnectorMetadata)
            : ({
                image: ETHEREUM_ICON,
                ...connector?.metadata,
              } as ConnectorMetadata),
        };
      }

      return {
        customName: actualName,
        customMetadata: connector?.metadata as ConnectorMetadata,
      };
    };

    const { customName, customMetadata } = getCustomData();

    return {
      name: customName,
      metadata: customMetadata,
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
    if (error?.message.includes(SIGNATURE_PENDING_ERROR)) {
      setConnectStep(ConnectStep.SIGN);
    }
  }, [error]);

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
