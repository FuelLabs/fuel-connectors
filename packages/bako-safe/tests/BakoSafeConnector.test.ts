import { beforeAll, describe, expect, test, vi } from 'vitest';

import type { StorageAbstract } from 'fuels';
import { BakoSafeConnector } from '../src/BakoSafeConnector';
import { BakoStorage } from '../src/BakoStorage';
import { APP_NAME } from '../src/constants';

describe('BakoSafeConnector', () => {
  const storage: StorageAbstract = new BakoStorage();

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
