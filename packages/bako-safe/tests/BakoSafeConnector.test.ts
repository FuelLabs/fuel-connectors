import { beforeAll, describe, expect, test, vi } from 'vitest';

import { Address, type StorageAbstract } from 'fuels';
import { BakoSafeConnector } from '../src/BakoSafeConnector';
import { BakoStorage } from '../src/BakoStorage';
import { APP_NAME, APP_NETWORK, APP_VERSION } from '../src/constants';

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

  test('ping', async () => {
    const connector = new BakoSafeConnector();
    const ping = await connector.ping();

    expect(ping).toEqual(false);
  });

  test('version', async () => {
    const connector = new BakoSafeConnector();
    const { app, network } = await connector.version();

    expect(app).toEqual(APP_VERSION);
    expect(network).toEqual(APP_NETWORK);
  });

  test('assets', async () => {
    const connector = new BakoSafeConnector();
    const assets = await connector.assets();

    expect(assets).toEqual([]);
  });

  test('signMessage', async () => {
    const connector = new BakoSafeConnector();

    expect(
      connector.signMessage(Address.fromRandom().toAddress(), 'message'),
    ).rejects.toThrowError('Method not implemented.');
  });

  test('disconnect', async () => {
    const connector = new BakoSafeConnector();
    const disconnect = await connector.disconnect();

    expect(disconnect).toEqual(false);
  });
});
