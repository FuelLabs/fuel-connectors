import { beforeAll, describe, expect, test, vi } from 'vitest';

import { StorageAbstract } from 'fuels';
import { BakoSafeConnector } from '../src/BakoSafeConnector';
import { APP_NAME } from '../src/constants';

describe('BakoSafeConnector', () => {
  let storage: StorageAbstract;
  beforeAll(() => {
    class Storage extends StorageAbstract {
      data: { [key: string]: string } = {};

      async getItem(key: string): Promise<string | null | undefined> {
        return this.data[key];
      }

      async setItem(key: string, value: string): Promise<void> {
        this.data[key] = value;
      }

      async removeItem(key: string): Promise<void> {
        delete this.data[key];
      }

      async clear(): Promise<void> {
        this.data = {};
      }
    }

    storage = new Storage();
  });

  test('constructor initializes properties correctly', async () => {
    const connector = new BakoSafeConnector({
      storage: storage,
    });
    expect(connector.name).toBe(APP_NAME);
    expect(connector.connected).toBe(false);
    expect(connector.installed).toBe(true);
  });

  test('should throw error if no storage provided', async () => {
    expect(() => {
      new BakoSafeConnector();
    }).toThrowError('No storage provided');
  });
});
