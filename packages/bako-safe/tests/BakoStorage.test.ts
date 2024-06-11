import type { StorageAbstract } from 'fuels';
import { beforeAll, describe, expect, test } from 'vitest';
import { BakoStorage } from '../src/BakoSafeStorage';

describe('BakoStorage', () => {
  let storage: StorageAbstract;
  const value = 'FAKE_VALUE';
  const invalid_value = undefined;
  const key = 'KEY';
  const invalid_key = 'INVALID_KEY';

  beforeAll(() => {
    storage = new BakoStorage();
  });

  test('setItem()', async () => {
    await storage.setItem(key, value);

    expect(await storage.getItem(key)).toEqual(value);
  });

  test('getItem()', async () => {
    expect(await storage.getItem(key)).toEqual(value);
    expect(await storage.getItem(invalid_key)).toEqual(invalid_value);
  });

  test('removeItem()', async () => {
    await storage.removeItem(key);

    expect(await storage.getItem(key)).toEqual(invalid_value);
  });

  test('clear()', async () => {
    await storage.setItem(key, value);
    await storage.setItem(invalid_key, value);
    await storage.clear();

    expect(await storage.getItem(key)).toEqual(invalid_value);
    expect(await storage.getItem(invalid_key)).toEqual(invalid_value);
  });
});
