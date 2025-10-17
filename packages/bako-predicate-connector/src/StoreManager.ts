import { STORAGE_KEYS } from './constants';
import type { BakoPersonalWalletData } from './types';
import { WINDOW } from './utils';

// biome-ignore lint/complexity/noStaticOnlyClass: util class
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
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
  }
}
