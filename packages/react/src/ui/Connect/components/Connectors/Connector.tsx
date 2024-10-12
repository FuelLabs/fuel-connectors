import type { FuelConnector } from 'fuels';
import { memo } from 'react';
import type { FuelUIContextType } from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../Core/ConnectorIcon';
import { ConnectorBadge } from './ConnectorBadge';
import { ConnectorItem, ConnectorName } from './styles';

interface ConnectorProps {
  connect: FuelUIContextType['dialog']['connect'];
  theme: FuelUIContextType['theme'];
  connector: FuelConnector;
  index: number;
}

const _Connector = ({ connect, theme, connector, index }: ConnectorProps) => {
  return (
    <ConnectorItem
      tabIndex={index + 1}
      key={connector.name}
      aria-label={`Connect to ${connector.name}`}
      data-installed={connector.installed}
      data-connected={connector.connected}
      onClick={(e) => {
        e.preventDefault();
        connect(connector);
      }}
    >
      <ConnectorIcon
        connectorMetadata={connector.metadata}
        connectorName={connector.name}
        size={32}
        theme={theme}
      />
      <ConnectorName>{connector.name}</ConnectorName>
      <ConnectorBadge
        name={connector.name}
        connected={connector.connected}
        installed={connector.installed}
      />
    </ConnectorItem>
  );
};

export const Connector = memo(_Connector);
