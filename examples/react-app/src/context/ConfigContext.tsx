import type { BN } from 'fuels';
import React, { createContext, useContext, type ReactNode } from 'react';

interface Config {
  explorerUrl: string;
  providerUrl: string;
  counterContractId: string;
  chainIdName: string;
  defaultAmount: BN;
}

const ConfigContext = createContext<Config | undefined>(undefined);

export const ConfigProvider = ({
  config,
  children,
}: {
  config: Config;
  children: ReactNode;
}) => (
  <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
