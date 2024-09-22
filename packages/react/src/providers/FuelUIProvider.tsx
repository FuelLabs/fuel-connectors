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
import { useFuel } from './FuelHooksProvider';

export type FuelUIProviderProps = {
  children?: ReactNode;
  fuelConfig: FuelConfig;
  theme?: string;
};

export enum DialogState {
  INSTALL = 'install',
  CONNECTING = 'connecting',
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
    retryConnect: () => Promise<void>;
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
  const [connector, setConnector] = useState<FuelConnector | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>(
    DialogState.INSTALL,
  );
  const [isOpen, setOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleCancel = useCallback(() => {
    setOpen(false);
    setConnector(null);
    setError(null);
  }, []);

  const handleConnect = () => {
    setOpen(true);
  };

  const handleBack = () => {
    setConnector(null);
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
      setError(err as Error);
    }
  }, [connectAsync, connector]);

  const handleSelectConnector = useCallback(
    async (connector: FuelConnector) => {
      if (!fuel) return setConnector(connector);
      setConnector(connector);
      if (connector.installed) {
        setDialogState(DialogState.CONNECTING);
        try {
          await connectAsync(connector.name);
        } catch (err) {
          setError(err as Error);
        }
      } else {
        setDialogState(DialogState.INSTALL);
      }
    },
    [fuel, connectAsync],
  );

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
          connect: handleSelectConnector,
          retryConnect: handleRetryConnect,
          back: handleBack,
        },
      }}
    >
      {children}
    </FuelConnectContext.Provider>
  );
}
