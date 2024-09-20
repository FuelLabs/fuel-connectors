import { useMemo, useState } from 'react';
import {
  type FuelUIContextType,
  useConnectUI,
} from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../ConnectorIcon';
import { ConnectorBadge } from './ConnectorBadge';

import type { FuelConnector } from 'fuels';
import { InfoCircleIcon } from '../../icons/InfoCircleIcon';
import { ConnectorsLoader } from './ConnectorsLoader';
import {
  ConnectorItem,
  ConnectorList,
  ConnectorName,
  GroupTitle,
  GroupTitleContainer,
} from './styles';

const renderConnector = (
  connect: FuelUIContextType['dialog']['connect'],
  theme: FuelUIContextType['theme'],
  connector: FuelConnector,
  index: number,
) => (
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

export function Connectors() {
  const {
    fuelConfig,
    connectors,
    isLoading,
    theme,
    dialog: { connect },
  } = useConnectUI();

  const [renderConnectorItem] = useState(() =>
    renderConnector.bind(null, connect, theme),
  );

  const { native, external } = useMemo(
    () =>
      connectors.reduce(
        (acc, curr) => {
          if (curr.name.startsWith('Fuel')) {
            acc.native.push(curr);
          } else {
            acc.external.push(curr);
          }

          return acc;
        },
        {
          native: [] as Array<FuelConnector>,
          external: [] as Array<FuelConnector>,
        },
      ),
    [connectors],
  );

  const shouldTitleGroups = !isLoading && !!native.length && !!external.length;

  return (
    <ConnectorList>
      {shouldTitleGroups && (
        <GroupTitleContainer>
          <GroupTitle>Native</GroupTitle>
          <InfoCircleIcon size={12} />
        </GroupTitleContainer>
      )}
      {!isLoading && native.map(renderConnectorItem)}
      {shouldTitleGroups && (
        <GroupTitleContainer>
          <GroupTitle>External</GroupTitle>
          <InfoCircleIcon size={12} />
        </GroupTitleContainer>
      )}
      {!isLoading && external.map(renderConnectorItem)}
      {isLoading && (
        <ConnectorsLoader items={fuelConfig.connectors?.length || 2} />
      )}
    </ConnectorList>
  );
}
