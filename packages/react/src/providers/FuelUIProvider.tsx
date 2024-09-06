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

import { Theme, type ThemeProps } from '@fuels/ui';
import { useFuel } from './FuelHooksProvider';

export type FuelUIProviderProps = {
  children?: ReactNode;
  fuelConfig: FuelConfig;
  theme?: string;
};

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
    isOpen: boolean;
    back: () => void;
    connect: (connector: FuelConnector) => void;
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

export function FuelUIProvider({
  fuelConfig,
  children,
  theme,
}: FuelUIProviderProps) {
  const { fuel } = useFuel();
  const { isPending: isConnecting, isError, connect } = useConnect();
  const { connectors, isLoading: isLoadingConnectors } = useConnectors();
  const [connector, setConnector] = useState<FuelConnector | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleCancel = () => {
    setOpen(false);
    setConnector(null);
  };

  const handleConnect = () => {
    setOpen(true);
  };

  const handleBack = () => {
    setConnector(null);
  };

  useEffect(() => {
    if (connector?.installed) {
      handleBack();
    }
  }, [connector?.installed, handleBack]);

  const handleSelectConnector = useCallback(
    async (connector: FuelConnector) => {
      if (!fuel) return setConnector(connector);

      if (connector.installed) {
        handleCancel();
        try {
          await connect(connector.name);
        } catch (err) {
          setError(err as Error);
        }
      } else {
        setConnector(connector);
      }
    },
    [fuel, connect, handleCancel],
  );

  const isLoading = useMemo(() => {
    const hasLoadedConnectors =
      (fuelConfig.connectors || []).length > connectors.length;
    return isLoadingConnectors || hasLoadedConnectors;
  }, [connectors, isLoadingConnectors, fuelConfig]);

  const dsTheme: ThemeProps = {
    hasBackground: false,
    appearance: theme === 'dark' ? 'dark' : 'light',
  };

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
          connector,
          isOpen,
          connect: handleSelectConnector,
          back: handleBack,
        },
      }}
    >
      <Theme {...dsTheme}>{children}</Theme>
    </FuelConnectContext.Provider>
  );
}
