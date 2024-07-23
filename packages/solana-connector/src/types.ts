import type { Web3Modal } from '@web3modal/solana';
import type { ProviderType } from '@web3modal/solana/dist/types/src/utils/scaffold';
import type { Provider as FuelProvider, JsonAbi } from 'fuels';

export interface SolanaPredicateConfig {
  abi: JsonAbi;
  bytecode: Uint8Array;
}

export type SolanaConfig = {
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  projectId?: string;
  predicateConfig?: SolanaPredicateConfig;
  solanaConfig?: ProviderType;
  web3Modal: Web3Modal;
};

export interface GetAccounts {
  id: string;
  jsonrpc: string;
  result: {
    pubkey: string;
  }[];
}

export enum SolanaChains {
  MAINNET = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  DEVNET = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  TESTNET = 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
}

export enum SolanaMethods {
  GET_ACCOUNTS = 'solana_getAccounts',
  SIGN_TRANSACTION = 'solana_signTransaction',
  SIGN_MESSAGE = 'solana_signMessage',
  REQUEST_ACCOUNTS = 'solana_requestAccounts',
}

export enum SolanaEvents {
  DISPLAY_URI = 'display_uri',
  SESSION_PING = 'session_ping',
  SESSION_EVENT = 'session_event',
  SESSION_UPDATE = 'session_update',
  SESSION_DELETE = 'session_delete',
}

export type Maybe<T> = T | null | undefined;
