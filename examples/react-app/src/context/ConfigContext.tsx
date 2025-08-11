import type { BN } from 'fuels';
import { type ReactNode, createContext, useContext } from 'react';

export interface Config {
  explorerUrl: string;
  providerUrl: string;
  counterContractId: string;
  chainIdName: string;
  defaultAmount: BN;
  assetId: string | undefined;
  assetSymbol: string | undefined;
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
