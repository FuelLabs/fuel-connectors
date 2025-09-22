import type { StorageAbstract } from 'fuels';

export class InMemoryStorage implements StorageAbstract {
  private storage: Map<string, string>;

  constructor() {
    this.storage = new Map<string, string>();
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    const value = this.storage.get(key);
    return value !== undefined ? value : null;
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}
