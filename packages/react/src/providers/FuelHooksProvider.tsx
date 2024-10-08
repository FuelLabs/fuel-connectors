import type { FuelConfig } from 'fuels';
import { Fuel } from 'fuels';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import type { NetworkConfig } from '../types';
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
  if (!fuelConfig) {
    throw new Error('fuelConfig is required');
  }
  const [fuel, _] = useState(() => new Fuel(fuelConfig));

  return (
    <FuelReactContext.Provider value={{ fuel, networks }}>
      <FuelEventsWatcher />
      {children}
    </FuelReactContext.Provider>
  );
};
