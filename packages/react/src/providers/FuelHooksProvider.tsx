import type { FuelConfig } from 'fuels';
import { Fuel } from 'fuels';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useRef } from 'react';

import type { NetworkConfig } from '../types';
import { useWindowConnectorEvent } from '../utils/useWindowConnectorEvent';
import { FuelEventsWatcher } from './FuelEventsWatcher';

type FuelProviderProps = {
  children?: ReactNode;
  fuelConfig?: FuelConfig;
  networks: Array<NetworkConfig>;
};

export type FuelReactContextType = {
  fuel: Fuel;
  networks: Array<NetworkConfig>;
};

export const FuelReactContext = createContext<FuelReactContextType | null>(
  null,
);

export const useFuel = () => {
  const context = useContext(FuelReactContext) as FuelReactContextType;
  if (!context) {
    throw new Error('useFuel must be used within a FuelHooksProvider');
  }
  return context;
};

export const FuelHooksProvider = ({
  children,
  fuelConfig,
  networks,
}: FuelProviderProps) => {
  const fuelRef = useRef<Fuel | null>(null);
  const fuel = useMemo(() => {
    if (fuelRef.current) {
      fuelRef.current?.destroy();
    }
    fuelRef.current = new Fuel(fuelConfig);
    return fuelRef.current;
  }, [fuelConfig]);

  useWindowConnectorEvent(fuel);

  return (
    <FuelReactContext.Provider value={{ fuel, networks }}>
      <FuelEventsWatcher />
      {children}
    </FuelReactContext.Provider>
  );
};
