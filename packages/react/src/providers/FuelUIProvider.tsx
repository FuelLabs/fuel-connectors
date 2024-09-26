import type { FuelConfig, FuelConnector } from 'fuels';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Theme, type ThemeProps } from '@fuels/ui';
import { NATIVE_CONNECTORS } from '../config';
import { useIsConnected } from '../hooks';
import { useConnect } from '../hooks/useConnect';
import { useConnectors } from '../hooks/useConnectors';
import type { UIConfig } from '../types';
import { isNativeConnector } from '../utils';

export type FuelUIProviderProps = {
  children?: ReactNode;
  uiConfig: UIConfig;
  fuelConfig: FuelConfig;
  theme?: string;
};

export enum Routes {
  LIST = 'list',
  INSTALL = 'install',
  CONNECTING = 'connecting',
  EXTERNAL_DISCLAIMER = 'disclaimer',
}

export type FuelUIContextType = {
  isConnected: boolean;
  uiConfig: UIConfig;
  fuelConfig: FuelConfig;
  theme: string;
  connectors: Array<FuelConnector>;
  isLoading: boolean;
  isConnecting: boolean;
  isError: boolean;
  connect: () => void;
  cancel: (params?: {
    clean?: boolean;
  }) => void;
  setError: (error: Error | null) => void;
  error: Error | null;
  dialog: {
    connector: FuelConnector | null;
    isOpen: boolean;
    back: () => void;
    connect: (connector: FuelConnector) => void;
    retryConnect: (connector: FuelConnector) => Promise<void>;
    // @TODO: Remove this to use tiny router library
    // react-router maybe too big for the bundle
    route: Routes;
    setRoute: (state: Routes) => void;
    // @TODO: This is meant to be private but is not possible at this moment
    _startConnection: (connector: FuelConnector) => void;
  };
};

export const FuelConnectContext = createContext<FuelUIContextType | null>(null);

export const useHasFuelConnectProvider = () => {
  const context = useContext(FuelConnectContext);
  return context !== undefined;
};

export const useConnectUI = () => {
  const context = useContext<FuelUIContextType | null>(FuelConnectContext);

  if (!context) {
    throw new Error('useConnectUI must be used within a FuelUIProvider');
  }

  return context;
};

const sortConnectors = (connectors: FuelConnector[]): FuelConnector[] => {
  return connectors.sort((a, b) => {
    if (a.connected !== b.connected) {
      return a.connected ? -1 : 1;
    }

    // Use temporary variables to represent "installed" status for sorting
    const aInstalled = NATIVE_CONNECTORS.includes(a.name) && a.installed;
    const bInstalled = NATIVE_CONNECTORS.includes(b.name) && b.installed;
    if (aInstalled !== bInstalled) {
      return aInstalled ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });
};

export function FuelUIProvider({
  fuelConfig,
  children,
  theme,
  uiConfig,
}: FuelUIProviderProps) {
  const { isPending: isConnecting, isError, connectAsync } = useConnect();
  const { connectors, isLoading: isLoadingConnectors } = useConnectors({
    query: { select: sortConnectors },
  });
  const { isConnected } = useIsConnected();
  const [connector, setConnector] = useState<FuelConnector | null>(null);
  const [dialogRoute, setDialogRoute] = useState<Routes>(Routes.LIST);
  const [isOpen, setOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!connector) return;
    const currentConnector = connectors.find((c: FuelConnector) => {
      return c.name === connector.name;
    });
    if (
      currentConnector &&
      connector.installed !== currentConnector?.installed
    ) {
      setConnector(currentConnector);
    }
  }, [connectors, connector]);

  const handleBack = () => {
    setError(null);
    setConnector(null);
    setDialogRoute(Routes.LIST);
  };

  const handleRetryConnect = useCallback(
    async (connector: FuelConnector) => {
      try {
        setError(null);
        await connectAsync(connector.name);
      } catch (err) {
        setError(err as Error);
      }
    },
    [connectAsync],
  );

  const handleStartConnection = useCallback(
    async (connector: FuelConnector) => {
      setDialogRoute(Routes.CONNECTING);
      await handleRetryConnect(connector);
    },
    [handleRetryConnect],
  );

  const handleSelectConnector = useCallback(
    async (connector: FuelConnector) => {
      setConnector(connector);
      if (!connector.installed) {
        setDialogRoute(Routes.INSTALL);
      } else if (isNativeConnector(connector)) {
        handleStartConnection(connector);
      } else {
        setDialogRoute(Routes.EXTERNAL_DISCLAIMER);
      }
    },
    [handleStartConnection],
  );

  const setRoute = useCallback((state: Routes) => {
    setDialogRoute(state);
  }, []);

  const isLoading = useMemo(() => {
    const hasLoadedConnectors =
      (fuelConfig.connectors || []).length > connectors.length;
    return isLoadingConnectors || hasLoadedConnectors;
  }, [connectors, isLoadingConnectors, fuelConfig]);

  const dsTheme: ThemeProps = {
    hasBackground: false,
    appearance: theme === 'dark' ? 'dark' : 'light',
  };
  const handleConnect = useCallback(() => {
    setConnector(null);
    setError(null);
    setDialogRoute(Routes.LIST);
    setOpen(true);
  }, []);

  const handleCancel = useCallback(({ clean }: { clean?: boolean } = {}) => {
    setError(null);
    setOpen(false);
    if (clean) {
      setConnector(null);
      setDialogRoute(Routes.LIST);
    }
  }, []);

  return (
    <FuelConnectContext.Provider
      value={{
        // General
        theme: theme || 'light',
        fuelConfig,
        uiConfig,
        error,
        setError,
        // Connection
        isConnected: !!isConnected,
        isConnecting,
        // UI States
        isLoading,
        isError,
        connectors,
        // Actions
        connect: handleConnect,
        cancel: handleCancel,
        // Dialog only
        dialog: {
          route: dialogRoute,
          setRoute,
          connector,
          isOpen,
          connect: handleSelectConnector,
          retryConnect: handleRetryConnect,
          back: handleBack,
          _startConnection: handleStartConnection,
        },
      }}
    >
      <Theme {...dsTheme}>{children}</Theme>
    </FuelConnectContext.Provider>
  );
}
