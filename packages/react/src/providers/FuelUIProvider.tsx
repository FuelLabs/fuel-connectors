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

import { useConnect } from '../hooks/useConnect';
import { useConnectors } from '../hooks/useConnectors';

import { NATIVE_CONNECTORS } from '../config';
import { useAccount, useBalance } from '../hooks';
import { useFuel } from './FuelHooksProvider';

export type FuelUIProviderProps = {
  children?: ReactNode;
  fuelConfig: FuelConfig;
  theme?: string;
  bridgeURL?: string;
};

export enum Routes {
  INSTALL = 'install',
  CONNECTING = 'connecting',
  BRIDGE = 'bridge',
  EXTERNAL_DISCLAIMER = 'disclaimer',
}

export type FuelUIContextType = {
  bridgeURL?: string;
  fuelConfig: FuelConfig;
  theme: string;
  connectors: Array<FuelConnector>;
  isLoading: boolean;
  isConnecting: boolean;
  isError: boolean;
  connect: () => void;
  cancel: (ignoreBalance?: boolean) => void;
  setError: (error: Error | null) => void;
  error: Error | null;
  dialog: {
    connector: FuelConnector | null;
    isOpen: boolean;
    back: () => void;
    connect: (connector: FuelConnector) => void;
    retryConnect: () => Promise<void>;
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
  bridgeURL,
}: FuelUIProviderProps) {
  const { fuel } = useFuel();
  const {
    isPending: isConnecting,
    data: isConnected,
    isError,
    connectAsync,
  } = useConnect();
  const { connectors, isLoading: isLoadingConnectors } = useConnectors({
    query: { select: sortConnectors },
  });
  const { account } = useAccount();
  const { balance } = useBalance({ account });
  const [connector, setConnector] = useState<FuelConnector | null>(null);
  const [dialogRoute, setDialogRoute] = useState<Routes>(Routes.INSTALL);
  const [isOpen, setOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // Controls is the process of connecting started if yes
  // allows the code to track balance and open bridge step
  const [isIgnoreBalance, setIgnoreBalance] = useState(true);

  // If connectors list is updated we need to update the data of the current
  // selected connector and change routes depending on the dialog route
  useEffect(() => {
    if (!connectors.length) return;
    const selectedConnector = connectors.find((c: FuelConnector) => {
      return c.name === connector?.name;
    });
    if (selectedConnector) {
      setConnector(selectedConnector);
      if (selectedConnector.installed && dialogRoute === Routes.INSTALL) {
        setDialogRoute(Routes.CONNECTING);
      }
    }
  }, [connectors, dialogRoute, connector]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    setConnector(null);
    setError(null);
    // If bridge popup is closed set to ignore balance changes
    // and avoid re-open the dialog
    if (dialogRoute === Routes.BRIDGE) {
      setIgnoreBalance(true);
    }
  }, [dialogRoute]);

  const handleConnect = () => {
    setError(null);
    setDialogRoute(Routes.INSTALL);
    setIgnoreBalance(false);
    setOpen(true);
  };

  const handleBack = () => {
    setConnector(null);
    setError(null);
  };

  useEffect(() => {
    if (!isConnected) return;
    if (balance?.isZero()) {
      if (!isOpen && !isIgnoreBalance) setOpen(true);
      setDialogRoute(Routes.BRIDGE);
      return;
    }
    if (balance?.gte(0)) {
      handleCancel();
    }
  }, [isConnected, isOpen, isIgnoreBalance, balance, handleCancel]);

  const handleRetryConnect = useCallback(async () => {
    if (!connector) return;
    try {
      setError(null);
      await connectAsync(connector.name);
    } catch (err) {
      setError(err as Error);
    }
  }, [connectAsync, connector]);

  const handleStartConnection = useCallback(
    async (connector: FuelConnector) => {
      setDialogRoute(Routes.CONNECTING);
      try {
        await connectAsync(connector.name);
      } catch (err) {
        setError(err as Error);
      }
    },
    [connectAsync],
  );

  const handleSelectConnector = useCallback(
    async (connector: FuelConnector) => {
      // TODO: evaluate if this checking is needed
      // maybe it can be removed
      if (!fuel) return setConnector(connector);
      setConnector(connector);

      // If the connect is not native show a disclaimer
      if (!NATIVE_CONNECTORS.includes(connector.name)) {
        setDialogRoute(Routes.EXTERNAL_DISCLAIMER);
        return;
      }

      if (connector.installed) {
        handleStartConnection(connector);
      } else {
        setDialogRoute(Routes.INSTALL);
      }
    },
    [fuel, handleStartConnection],
  );

  const setRoute = useCallback((state: Routes) => {
    setDialogRoute(state);
  }, []);

  const isLoading = useMemo(() => {
    const hasLoadedConnectors =
      (fuelConfig.connectors || []).length > connectors.length;
    return isLoadingConnectors || hasLoadedConnectors;
  }, [connectors, isLoadingConnectors, fuelConfig]);

  return (
    <FuelConnectContext.Provider
      value={{
        bridgeURL,
        fuelConfig,
        theme: theme || 'light',
        isLoading,
        isConnecting,
        isError,
        connectors,
        error,
        setError,
        connect: handleConnect,
        cancel: handleCancel,
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
      {children}
    </FuelConnectContext.Provider>
  );
}
