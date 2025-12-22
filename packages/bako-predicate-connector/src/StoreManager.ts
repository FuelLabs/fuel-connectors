import { STORAGE_KEYS, STORAGE_PREFIX, WINDOW } from './constants';
import type { BakoPersonalWalletData } from './types';

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
    const data = StoreManager.get('BAKO_PERSONAL_WALLET');
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      if (!parsed.address || !parsed.configurable || !parsed.version) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  static remove(key: keyof typeof STORAGE_KEYS): void {
    if (!WINDOW) return;
    window.localStorage.removeItem(STORAGE_KEYS[key]);
  }

  static clear(): void {
    if (!WINDOW) return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  }
}
