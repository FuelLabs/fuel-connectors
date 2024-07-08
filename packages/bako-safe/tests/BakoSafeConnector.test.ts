import { describe, expect, test } from 'vitest';

import {
  Address,
  type Asset,
  type JsonAbi,
  type Network,
  type StorageAbstract,
} from 'fuels';
import { BakoSafeConnector } from '../src/BakoSafeConnector';
import { BakoStorage } from '../src/BakoSafeStorage';
import { APP_NAME, APP_NETWORK, APP_VERSION } from '../src/constants';
import { MockedRequestAPI } from './mocks/api';
import { CURRENT_NETWORK, STATE } from './mocks/constantes';

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
});

describe('ping()', () => {
  test('ping', async () => {
    const connector = new BakoSafeConnector();
    const ping = await connector.ping();

    expect(ping).toEqual(false);
  });
});

describe('version()', () => {
  test('app_version', async () => {
    const connector = new BakoSafeConnector();
    const { app } = await connector.version();

    expect(app).toEqual(APP_VERSION);
  });

  test('app_network', async () => {
    const connector = new BakoSafeConnector();
    const { network } = await connector.version();

    expect(network).toEqual(APP_NETWORK);
  });
});

describe('networks()', () => {
  test('return networks list', async () => {
    const connector = new BakoSafeConnector({
      api: new MockedRequestAPI(),
    });

    const networks = await connector.networks();
    expect(networks).toEqual([
      {
        chainId: 0,
        url: CURRENT_NETWORK,
      },
    ]);
  });
});

describe('currentNetwork()', () => {
  test('return current network', async () => {
    const connector = new BakoSafeConnector({
      api: new MockedRequestAPI(),
    });

    const current_network = await connector.currentNetwork();
    expect(current_network).toEqual({
      chainId: 0,
      url: CURRENT_NETWORK,
    });
  });
});

describe('isConnected()', () => {
  test('return connection state', async () => {
    const storage: StorageAbstract = new BakoStorage();
    await storage.setItem('sessionId', 'fake_session_id');

    const connector = new BakoSafeConnector({
      api: new MockedRequestAPI(),
      storage,
    });

    const state = await connector.isConnected();

    expect(state).toEqual(STATE);
  });
});

describe('disconnect()', () => {
  test('returns a false', async () => {
    const storage: StorageAbstract = new BakoStorage();
    await storage.setItem('sessionId', 'fake_session_id');

    const connector = new BakoSafeConnector({
      api: new MockedRequestAPI(),
      storage,
    });
    const disconnect = await connector.disconnect();

    expect(disconnect).toEqual(false);
  });
});

describe('signMessage()', () => {
  test('throws error', async () => {
    const connector = new BakoSafeConnector();

    expect(
      connector.signMessage(Address.fromRandom().toAddress(), 'message'),
    ).rejects.toThrowError('Method not implemented.');
  });
});

describe('assets()', () => {
  test('returns a empty array', async () => {
    const connector = new BakoSafeConnector();
    const assets = await connector.assets();

    expect(assets).toEqual([]);
  });
});

describe('addAsset()', () => {
  test('throws error', async () => {
    const connector = new BakoSafeConnector();
    const asset: Asset = {
      name: '',
      symbol: '',
      icon: '',
      networks: [],
    };
    await expect(() => connector.addAsset(asset)).rejects.toThrowError(
      'Method not implemented.',
    );
  });
});

describe('addAssets()', () => {
  test('throws error', async () => {
    const connector = new BakoSafeConnector();
    await expect(() => connector.addAssets([])).rejects.toThrowError(
      'Method not implemented.',
    );
  });
});

describe('addAbi()', () => {
  test('throws error', async () => {
    const connector = new BakoSafeConnector();
    await expect(() =>
      connector.addABI('contractId', {} as unknown as JsonAbi),
    ).rejects.toThrowError('Method not implemented.');
  });
});

describe('getAbi()', () => {
  test('throws error', async () => {
    const connector = new BakoSafeConnector();
    await expect(() => connector.getABI('contractId')).rejects.toThrowError(
      'Method not implemented.',
    );
  });
});

describe('hasAbi()', () => {
  test('throws error', async () => {
    const connector = new BakoSafeConnector();

    await expect(
      async () => await connector.hasABI('contractId'),
    ).rejects.toThrow('Method not implemented.');
  });
});

describe('addNetwork()', () => {
  test('throws error', async () => {
    const connector = new BakoSafeConnector();
    await expect(() => connector.addNetwork('')).rejects.toThrowError(
      'Method not implemented.',
    );
  });
});

describe('selectNetwork()', () => {
  const network: Network = {
    chainId: 1,
    url: '',
  };
  test('throws error', async () => {
    const connector = new BakoSafeConnector();
    await expect(() => connector.selectNetwork(network)).rejects.toThrowError(
      'Method not implemented.',
    );
  });
});
