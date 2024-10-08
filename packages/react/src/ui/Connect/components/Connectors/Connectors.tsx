import { useMemo } from 'react';
import { useConnectUI } from '../../../../providers/FuelUIProvider';

import type { FuelConnector } from 'fuels';
import { NATIVE_CONNECTORS } from '../../../../config';
import { Connector } from './Connector';
import { ConnectorsLoader } from './ConnectorsLoader';
import { ConnectorList, GroupLastTitle, GroupTitle } from './styles';

interface GroupedConnectors {
  native: FuelConnector[];
  external: FuelConnector[];
}

export function Connectors() {
  const {
    fuelConfig,
    connectors,
    isLoading,
    theme,
    dialog: { connect },
  } = useConnectUI();

  const { native, external } = useMemo<GroupedConnectors>(() => {
    const external = connectors.filter((conn) => {
      return !NATIVE_CONNECTORS.includes(conn.name);
    });
    const native = connectors.filter((conn) => {
      return NATIVE_CONNECTORS.includes(conn.name);
    });

    return {
      native,
      external,
    };
  }, [connectors]);

  const shouldTitleGroups = !!native.length && !!external.length;

  if (isLoading) {
    return (
      <ConnectorList>
        <ConnectorsLoader items={fuelConfig.connectors?.length || 2} />
      </ConnectorList>
    );
  }

  return (
    <ConnectorList>
      {shouldTitleGroups && <GroupTitle>Fuel Native Wallets</GroupTitle>}
      {native.map((connector, index) => {
        return (
          <Connector
            key={connector.name}
            connect={connect}
            theme={theme}
            connector={connector}
            index={index}
          />
        );
      })}
      {shouldTitleGroups && <GroupLastTitle>Non-Native Wallets</GroupLastTitle>}
      {external.map((connector, index) => {
        return (
          <Connector
            key={connector.name}
            connect={connect}
            theme={theme}
            connector={connector}
            index={index}
          />
        );
      })}
    </ConnectorList>
  );
}
