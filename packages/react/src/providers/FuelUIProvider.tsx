import {
  type FuelConfig,
  type FuelConnector,
  FuelConnectorEventTypes,
} from 'fuels';
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
import { useIsConnected } from '../hooks';
import type { UIConfig } from '../types';
import { isNativeConnector } from '../utils';
import { useFuel } from './FuelHooksProvider';

export type FuelUIProviderProps = {
  children?: ReactNode;
  uiConfig: UIConfig;
  fuelConfig: FuelConfig;
  theme?: 'dark' | 'light';
};

export enum Routes {
  List = 'LIST',
  Install = 'INSTALL',
  Connecting = 'CONNECTING',
  PredicateExternalDisclaimer = 'PREDICATE_EXTERNAL_DISCLAIMER',
  PredicateAddressDisclaimer = 'PREDICATE_ADDRESS_DISCLAIMER',
  SignatureError = 'SIGNATURE_ERROR',
  PredicateVersionSelector = 'PREDICATE_VERSION_SELECTOR',
  ConsolidateCoins = 'CONSOLIDATE_COINS',
}

export type FuelUIContextType = {
  isConnected: boolean;
  uiConfig: UIConfig;
  fuelConfig: FuelConfig;
  theme: 'dark' | 'light';
  connectors: Array<FuelConnector>;
  isLoading: boolean;
  isConnecting: boolean;
  isError: boolean;
  connect: () => void;
  cancel: (params?: { clean?: boolean }) => void;
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
  const { fuel } = useFuel();
  const { isPending: isConnecting, isError, connectAsync } = useConnect();
  const { connectors, isLoading: isLoadingConnectors } = useConnectors({
    query: { select: sortConnectors },
  });
  const { isConnected } = useIsConnected();
  const [connector, setConnector] = useState<FuelConnector | null>(null);
  const [dialogRoute, setDialogRoute] = useState<Routes>(Routes.List);
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

  const handleBack = useCallback(() => {
    setError(null);
    setConnector(null);
    setDialogRoute(Routes.List);
  }, []);

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
      setDialogRoute(Routes.Connecting);
      await handleRetryConnect(connector);
    },
    [handleRetryConnect],
  );

  useEffect(() => {
    const handleStartConsolidation = () => {
      setDialogRoute(Routes.ConsolidateCoins);
      setOpen(true);
    };

    fuel.on(FuelConnectorEventTypes.consolidateCoins, handleStartConsolidation);

    return () => {
      fuel.off(
        FuelConnectorEventTypes.consolidateCoins,
        handleStartConsolidation,
      );
    };
  }, [fuel]);

  const handleSelectConnector = useCallback(
    async (connector: FuelConnector) => {
      setConnector(connector);
      if (!connector.installed) {
        setDialogRoute(Routes.Install);
      } else if (isNativeConnector(connector)) {
        handleStartConnection(connector);
      } else {
        setDialogRoute(Routes.PredicateExternalDisclaimer);
      }
    },
    [handleStartConnection],
  );

  const isLoading = useMemo(() => {
    const hasLoadedConnectors =
      (fuelConfig.connectors || []).length > connectors.length;
    return isLoadingConnectors || hasLoadedConnectors;
  }, [connectors, isLoadingConnectors, fuelConfig]);

  const handleConnect = useCallback(() => {
    setConnector(null);
    setError(null);
    setDialogRoute(Routes.List);
    setOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setError(null);
    setOpen(false);
  }, []);

  useEffect(() => {
    const css = document.createElement('style');
    css.appendChild(
      document.createTextNode(
        `@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap"); .fuel-connectors * { box-sizing: border-box; } .fuel-connectors .fuel-connectors-dialog-content:focus { outline: none; } @media (max-width: 430px) { .fuel-connectors .fuel-connectors-dialog-content { top: 50%; width: 100%; border-radius: 36px; } } .fuel-connectors .fuel-connectors-connector-item { transition: background-color 50ms cubic-bezier(0.16, 1, 0.3, 1); background-color: var(--fuel-connector-background); } .fuel-connectors .fuel-connectors-connector-item:active { opacity: 0.8; } .fuel-connectors .fuel-connectors-connector-item:hover { background-color: var(--fuel-connector-hover); } .fuel-connectors .fuel-connectors-connector-button { transition: background-color 50ms cubic-bezier(0.16, 1, 0.3, 1); background-color: var(--fuel-button-background); color: var(--fuel-color-bold); } .fuel-connectors .fuel-connectors-connector-button:visited { color: var(--fuel-color-bold); } .fuel-connectors .fuel-connectors-connector-button:hover { background-color: var(--fuel-button-background-hover); } .fuel-connectors .fuel-connectors-connector-button-primary { transition: background-color 50ms cubic-bezier(0.16, 1, 0.3, 1); background-color: var(--fuel-green-11); color: var(--fuel-black-color); } .fuel-connectors .fuel-connectors-connector-button-primary:visited { color: var(--fuel-black-color); } .fuel-connectors .fuel-connectors-connector-button-primary:hover { background-color: var(--fuel-green-11); } .fuel-connectors .fuel-connectors-back-icon { transition: background-color 50ms cubic-bezier(0.16, 1, 0.3, 1); } .fuel-connectors .fuel-connectors-back-icon[data-connector='false'] { visibility: hidden; } .fuel-connectors .fuel-connectors-back-icon:hover, .fuel-connectors .fuel-connectors-back-icon:active { opacity: 1; background-color: var(--fuel-connector-hover); } .fuel-connectors .fuel-connectors-close-icon { transition: background-color 50ms cubic-bezier(0.16, 1, 0.3, 1); } .fuel-connectors .fuel-connectors-close-icon:hover, .fuel-connectors .fuel-connectors-close-icon:active { opacity: 1; background-color: var(--fuel-connector-hover); } .fuel-connectors .fuel-connectors-button-base { cursor: pointer; } .fuel-connectors .fuel-connectors-button:disabled { cursor: not-allowed; } .fuel-connectors .fuel-connectors-button { transition: background-color 50ms cubic-bezier(0.16, 1, 0.3, 1); background-color: var(--fuel-green-11); } .fuel-connectors .fuel-connectors-button:disabled { background-color: var(--fuel-border-color); } .fuel-connectors .fuel-connectors-button-disconnect { transition: background-color 50ms cubic-bezier(0.16, 1, 0.3, 1); background-color: var(--fuel-button-background); } .fuel-connectors .fuel-connectors-button-disconnect:hover { background-color: var(--fuel-button-background-hover); } .fuel-connectors .fuel-connectors-link-underline:hover { text-decoration: underline; } @keyframes fuelOverlayShow { from { opacity: 0; } to { opacity: 1; } } @keyframes fuelSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes fuelContentShow { from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } } @keyframes fuelLoader { 0% { background-position: -468px 0 } 100% { background-position: 468px 0 } }`,
      ),
    );
    document.head.appendChild(css);
    return () => {
      document.head.removeChild(css);
    };
  }, []);

  const contextValue = useMemo(
    () => ({
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
        setRoute: setDialogRoute,
        connector,
        isOpen,
        connect: handleSelectConnector,
        retryConnect: handleRetryConnect,
        back: handleBack,
        _startConnection: handleStartConnection,
      },
    }),
    [
      theme,
      fuelConfig,
      uiConfig,
      error,
      isConnected,
      isConnecting,
      isLoading,
      isError,
      connectors,
      connector,
      dialogRoute,
      isOpen,
      handleCancel,
      handleStartConnection,
      handleSelectConnector,
      handleConnect,
      handleRetryConnect,
      handleBack,
    ],
  );

  return (
    <FuelConnectContext.Provider value={contextValue}>
      {children}
    </FuelConnectContext.Provider>
  );
}
