import type { FuelConfig } from 'fuels';
import { Fuel } from 'fuels';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';

import { FuelEventsWatcher } from './FuelEventsWatcher';

type FuelProviderProps = {
  children?: ReactNode;
  fuelConfig?: FuelConfig;
};

export type FuelReactContextType = {
  fuel: Fuel;
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
}: FuelProviderProps) => {
  const fuel = useMemo(() => {
    return new Fuel(fuelConfig);
  }, [fuelConfig]);

  return (
    <FuelReactContext.Provider value={{ fuel }}>
      <FuelEventsWatcher fuelConfig={fuelConfig} />
      {children}
    </FuelReactContext.Provider>
  );
};
