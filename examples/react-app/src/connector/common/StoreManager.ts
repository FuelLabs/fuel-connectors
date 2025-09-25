import type { BakoPersonalWalletData } from './types';
import { WINDOW } from './utils';

const STORAGE_KEYS = {
  SESSION_ID: 'sessionId',
  CURRENT_ACCOUNT: 'currentAccount',
  BAKO_PERSONAL_WALLET: 'bakoPersonalWallet',
  SELECTED_PREDICATE_KEY: 'fuel_selected_predicate_version',
} as const;

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class StoreManager {
  static get(key: keyof typeof STORAGE_KEYS): string | null {
    if (!WINDOW) return null;
    return window.localStorage.getItem(STORAGE_KEYS[key]);
  }

  static set(key: keyof typeof STORAGE_KEYS, value: string): void {
    if (!WINDOW) return;
    window.localStorage.setItem(STORAGE_KEYS[key], value);
  }

  static setPersonalWallet(value: BakoPersonalWalletData): void {
    StoreManager.set('BAKO_PERSONAL_WALLET', JSON.stringify(value));
  }

  static getPersonalWallet(): BakoPersonalWalletData | null {
    if (!WINDOW) return null;
    return JSON.parse(StoreManager.get('BAKO_PERSONAL_WALLET') ?? '{}');
  }

  static remove(key: keyof typeof STORAGE_KEYS): void {
    if (!WINDOW) return;
    window.localStorage.removeItem(STORAGE_KEYS[key]);
  }

  static clear(): void {
    if (!WINDOW) return;
    window.localStorage.clear();
  }
}
