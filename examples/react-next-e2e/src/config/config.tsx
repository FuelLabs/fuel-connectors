import { counter as COUNTER_CONTRACT_ID_LOCAL } from '@fuel-connectors/react-app/src/types/contract-ids-local.json';
import { counter as COUNTER_CONTRACT_ID_MAINNET } from '@fuel-connectors/react-app/src/types/contract-ids-mainnet.json';
import { counter as COUNTER_CONTRACT_ID_TESTNET } from '@fuel-connectors/react-app/src/types/contract-ids-testnet.json';
import { type CHAIN_IDS, bn } from 'fuels';

export const CHAIN_ID_NAME = process.env
  .NEXT_PUBLIC_CHAIN_ID_NAME as keyof typeof CHAIN_IDS.fuel;
export const PROVIDER_URL = process.env.NEXT_PUBLIC_PROVIDER_URL;
export const DEFAULT_AMOUNT = bn.parseUnits(
  CHAIN_ID_NAME === 'mainnet' ? '0.000000001' : '0.0001',
);

function getContractId() {
  switch (CHAIN_ID_NAME) {
    case 'mainnet':
      return COUNTER_CONTRACT_ID_MAINNET;
    case 'testnet':
      return COUNTER_CONTRACT_ID_TESTNET;
    default:
      return COUNTER_CONTRACT_ID_LOCAL;
  }
}

export const COUNTER_CONTRACT_ID = getContractId();

export const EXPLORER_URL_MAP: Record<keyof typeof CHAIN_IDS.fuel, string> = {
  testnet: 'https://app-testnet.fuel.network',
  devnet: 'https://app-testnet.fuel.network',
  mainnet: 'https://app-mainnet.fuel.network',
};

export const EXPLORER_LOCAL_URL = 'http://localhost:3001';

export const EXPLORER_URL =
  EXPLORER_URL_MAP[CHAIN_ID_NAME] || EXPLORER_LOCAL_URL;
