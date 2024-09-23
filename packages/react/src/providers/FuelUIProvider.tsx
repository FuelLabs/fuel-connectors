import type { Fuel, FuelConfig, FuelConnector } from 'fuels';
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

import { BADGE_BLACKLIST } from '../ui/Connect/components/Connectors/ConnectorBadge';

export type FuelUIProviderProps = {
  children?: ReactNode;
  fuelConfig: FuelConfig;
  theme?: string;
};

export enum DialogState {
  INSTALL = 'install',
  CONNECTING = 'connecting',
  INSTALLED = 'installed',
  ERROR = 'error',
}

export type FuelUIContextType = {
  fuelConfig: FuelConfig;
  theme: string;
  connectors: Array<FuelConnector>;
  isLoading: boolean;
  isConnecting: boolean;
  isError: boolean;
  connect: () => void;
  cancel: () => void;
  setError: (error: Error | null) => void;
  error: Error | null;
  dialog: {
    connector: FuelConnector | null;
    state: DialogState;
    isOpen: boolean;
    back: () => void;
    connect: (connector: FuelConnector) => void;
    action: (connector: FuelConnector | null) => Promise<void>;
    retryConnect: () => Promise<void>;
  };
};

const DIALOG_DEFAULT_STATE = DialogState.INSTALL;

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
    const aInstalled = !BADGE_BLACKLIST.includes(a.name) && a.installed;
    const bInstalled = !BADGE_BLACKLIST.includes(b.name) && b.installed;
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
}: FuelUIProviderProps) {
  const {
    isPending: isConnecting,
    data: isConnected,
    isError,
    connect,
    connectAsync,
  } = useConnect();
  const { connectors, isLoading: isLoadingConnectors } = useConnectors({
    query: { select: sortConnectors },
  });
  const [connector, setConnector] = useState<FuelConnector | null>(null);
  const [dialogState, setDialogState] =
    useState<DialogState>(DIALOG_DEFAULT_STATE);
  const [isOpen, setOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resetStates = useCallback(() => {
    setDialogState(DIALOG_DEFAULT_STATE);
    setConnector(null);
    setError(null);
  }, []);

  const handleCancel = useCallback(() => {
    setOpen(false);
    resetStates();
  }, [resetStates]);

  const handleConnect = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (!isConnected) return;
    handleCancel();
  }, [isConnected, handleCancel]);

  const handleRetryConnect = useCallback(async () => {
    if (!connector) return;
    try {
      setError(null);
      await connectAsync(connector.name);
    } catch (err) {
      onError(err as Error);
    }
  }, [connectAsync, connector]);

  const onError = useCallback((err: Error) => {
    setDialogState(DialogState.ERROR);
    setError(err);
  }, []);

  const handleDialogAction = useCallback(
    async (_connector: FuelConnector | null = connector) => {
      if (!_connector) return;

      setDialogState((prev) => {
        if (prev === DialogState.ERROR || prev === DialogState.INSTALLED)
          return DialogState.CONNECTING;
        if (prev === DialogState.CONNECTING && _connector?.installed)
          return DialogState.INSTALLED;
        if (prev === DialogState.INSTALL) return DialogState.CONNECTING;

        return prev;
      });
    },
    [connector],
  );

  const handleSelectConnector = useCallback(
    async (_connector: FuelConnector) => {
      setError(null);
      setConnector(_connector);
      if (_connector.external) {
        setOpen(false);
        return;
      }
      if (_connector.installed) {
        handleDialogAction(_connector);
      }
    },
    [handleDialogAction],
  );

  // Handle connection
  useEffect(() => {
    if (
      (dialogState === DialogState.INSTALL ||
        dialogState === DialogState.CONNECTING) &&
      connector?.installed
    ) {
      connect(connector.name, {
        onError,
        onSuccess: (res) => {
          if (res) {
            setOpen(false);
            return;
          }
          onError(new Error('Failed to connect'));
        },
      });
    }
  }, [connect, connector, dialogState, onError]);

  // Handle install
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let depth = 0;
    const shouldRetry = () =>
      dialogState === DialogState.CONNECTING && !connector?.installed;
    if (shouldRetry()) {
      waitForConnection();
    }

    async function waitForConnection() {
      depth++;
      timeout = setTimeout(async () => {
        if (!connector || connector.connected) {
          clearTimeout(timeout);
          return;
        }
        try {
          await connector?.ping().catch(() => false);

          if (connector?.installed) {
            handleDialogAction(connector);
          }
        } catch (err) {
          onError(err as Error);
        } finally {
          if (depth > 60) {
            onError(new Error('Failed to connect'));
          } else if (shouldRetry()) {
            clearTimeout(timeout);
            timeout = setTimeout(waitForConnection, 1000);
          }
        }
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [dialogState, connector, handleDialogAction, onError]);

  const isLoading = useMemo(() => {
    const hasLoadedConnectors =
      (fuelConfig.connectors || []).length > connectors.length;
    return isLoadingConnectors || hasLoadedConnectors;
  }, [connectors, isLoadingConnectors, fuelConfig]);

  return (
    <FuelConnectContext.Provider
      value={{
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
          state: dialogState,
          connector,
          isOpen,
          action: handleDialogAction,
          connect: handleSelectConnector,
          retryConnect: handleRetryConnect,
          back: resetStates,
        },
      }}
    >
      {children}
    </FuelConnectContext.Provider>
  );
}
