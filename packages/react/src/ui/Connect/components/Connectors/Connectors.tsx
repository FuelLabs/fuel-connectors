import { useMemo, useState } from 'react';
import {
  type FuelUIContextType,
  useConnectUI,
} from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../ConnectorIcon';
import { ConnectorBadge } from './ConnectorBadge';

import type { FuelConnector } from 'fuels';
import { ConnectorsLoader } from './ConnectorsLoader';
import {
  ConnectorItem,
  ConnectorList,
  ConnectorName,
  GroupFirstTitleContainer,
  GroupLastTitle,
  GroupLastTitleContainer,
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
          const array = curr.external ? acc.external : acc.native;
          array.push(curr);

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
        <GroupFirstTitleContainer>
          <GroupLastTitle>Fuel Native Wallets</GroupLastTitle>
        </GroupFirstTitleContainer>
      )}
      {!isLoading && native.map(renderConnectorItem)}
      {shouldTitleGroups && (
        <GroupLastTitleContainer>
          <GroupLastTitle>Non-Native Wallets</GroupLastTitle>
        </GroupLastTitleContainer>
      )}
      {!isLoading && external.map(renderConnectorItem)}
      {isLoading && (
        <ConnectorsLoader items={fuelConfig.connectors?.length || 2} />
      )}
    </ConnectorList>
  );
}
