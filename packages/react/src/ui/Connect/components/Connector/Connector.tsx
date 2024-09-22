import type { FuelConnector } from 'fuels';
import { useEffect, useState } from 'react';

import { useConnectUI } from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../ConnectorIcon';

import { useQuery } from '@tanstack/react-query';
import { useConnect, useConnectors } from '../../../../hooks';
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
  const { connect } = useConnect();
  const { isLoading } = useQuery({
    queryKey: [connector.name],
    queryFn: async () => {
      const isInstall = await connector.ping();
      if (isInstall) connect(connector.name);
      return isInstall;
    },
    initialData: connector.installed,
    refetchInterval: 1000,
  });

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
