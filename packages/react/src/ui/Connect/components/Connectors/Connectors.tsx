import { useCallback, useMemo } from 'react';
import { useConnectUI } from '../../../../providers/FuelUIProvider';

import type { FuelConnector } from 'fuels';
import { NATIVE_CONNECTORS } from '../../../../config';
import { Connector } from './Connector';
import { ConnectorsLoader } from './ConnectorsLoader';
import { EmailLogin } from './EmailLogin';
import { ConnectorList, GroupLastTitle, GroupTitle } from './styles';

interface SocialConnectorWithEmail extends FuelConnector {
  sendCode: (email: string) => Promise<void>;
  loginWithCode: (code: string) => Promise<void>;
}

const SOCIAL_CONNECTOR_NAME = 'Social Login';

interface GroupedConnectors {
  native: FuelConnector[];
  external: FuelConnector[];
  socialConnector: FuelConnector | null;
}

// Allowed connectors for mobile platforms
const ALLOWED_MOBILE_CONNECTORS = [
  'Fuelet Wallet',
  'Burner Wallet',
  'Ethereum Wallets',
  'Solana Wallets',
  'Social Login',
];

export function Connectors() {
  const {
    fuelConfig,
    connectors,
    isLoading,
    theme,
    socialLogin,
    dialog: { connect },
  } = useConnectUI();

  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
      navigator.userAgent,
    );
  }, []);
  const { native, external, socialConnector } =
    useMemo<GroupedConnectors>(() => {
      const filteredConnectors = isMobile
        ? connectors.filter((conn) =>
            ALLOWED_MOBILE_CONNECTORS.some((name) => name === conn.name),
          )
        : connectors;

      const socialConnector =
        filteredConnectors.find(
          (conn) => conn.name === SOCIAL_CONNECTOR_NAME,
        ) || null;

      const external = filteredConnectors.filter((conn) => {
        return (
          !NATIVE_CONNECTORS.includes(conn.name) &&
          conn.name !== SOCIAL_CONNECTOR_NAME
        );
      });
      const native = filteredConnectors.filter((conn) => {
        return NATIVE_CONNECTORS.includes(conn.name);
      });

      return {
        native,
        external,
        socialConnector,
      };
    }, [connectors, isMobile]);

  const shouldTitleGroups = !!native.length && !!external.length;

  const handleSubmitEmail = useCallback(
    async (email: string) => {
      if (!socialConnector) {
        throw new Error('Social connector not available');
      }
      const connector = socialConnector as SocialConnectorWithEmail;
      await connector.sendCode(email);
    },
    [socialConnector],
  );

  const handleSubmitCode = useCallback(
    async (code: string) => {
      if (!socialConnector) {
        throw new Error('Social connector not available');
      }
      const connector = socialConnector as SocialConnectorWithEmail;
      await connector.loginWithCode(code);
      // After successful login, connect the wallet
      connect(socialConnector);
    },
    [socialConnector, connect],
  );

  if (isLoading) {
    return (
      <ConnectorList>
        <ConnectorsLoader items={fuelConfig.connectors?.length || 2} />
      </ConnectorList>
    );
  }

  return (
    <ConnectorList>
      {socialConnector && socialLogin && (
        <EmailLogin
          onSubmitEmail={handleSubmitEmail}
          onSubmitCode={handleSubmitCode}
        />
      )}
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
      {shouldTitleGroups && !!external.length && (
        <GroupLastTitle>Non-Native Wallets</GroupLastTitle>
      )}
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
