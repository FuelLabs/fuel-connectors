import path from 'node:path';
import { type Asset, type Network, type Provider, Wallet } from 'fuels';
import { launchTestNode } from 'fuels/test-utils';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { TestPredicatedConnector } from './testConnector';

describe('Bako Predicated Connector', () => {
  const snapshotPath = path.join(__dirname, '');

  let fuelProvider: Provider;
  let stopProvider: () => void;
  let connector: TestPredicatedConnector;

  beforeAll(async () => {
    process.env.GENESIS_SECRET =
      '0x6e48a022f9d4ae187bca4e2645abd62198ae294ee484766edbdaadf78160dc68';
    const { cleanup, provider } = await launchTestNode({
      nodeOptions: {
        args: ['--snapshot', snapshotPath],
        loggingEnabled: false,
      },
    });

    fuelProvider = provider;
    stopProvider = cleanup;
  });

  beforeEach(() => {
    connector = new TestPredicatedConnector();
  });

  afterAll(() => {
    stopProvider?.();
  });

  describe('setupPredicate()', () => {
    test('custom predicate', async () => {
      const providersSpy = vi
        // biome-ignore lint/suspicious/noExplicitAny: using any to mock function
        .spyOn(connector as any, '_get_providers')
        .mockResolvedValue({
          fuelProvider,
        });

      const wallet = Wallet.generate({ provider: fuelProvider });

      // @ts-expect-error emitAccountChange is protected
      connector.emitAccountChange(wallet.address);

      // @ts-expect-error getPredicateVersions is protected
      const versions = connector.getPredicateVersions();
      // @ts-expect-error customPredicate is protected
      connector.customPredicate = Object.values(versions)[0];

      // biome-ignore lint/suspicious/noExplicitAny: using any to mock function
      vi.spyOn(connector as any, '_get_providers').mockImplementation(
        async () => ({
          fuelProvider,
        }),
      );

      // @ts-expect-error setupPredicate is protected
      const predicateAccount = await connector.setupPredicate();

      expect(predicateAccount).toBeDefined();
      // @ts-expect-error predicateAccount is protected
      expect(connector.predicateAccount).toBe(predicateAccount);

      providersSpy.mockRestore();
    });
  });

  describe('currentAccount()', () => {
    test('throws error', async () => {
      await expect(() => connector.currentAccount()).rejects.toThrowError(
        'No connected accounts',
      );
    });
  });

  describe('signMessage()', () => {
    test('throws error', async () => {
      await expect(() =>
        connector.signMessage('address', 'message'),
      ).rejects.toThrowError('A predicate account cannot sign messages');
    });
  });

  describe('assets()', () => {
    test('returns an empty array', async () => {
      expect(await connector.assets()).to.deep.equal([]);
    });
  });

  describe('addAsset()', () => {
    test('throws error', async () => {
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
      await expect(() => connector.addAssets([])).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('addAbi()', () => {
    test('throws error', async () => {
      await expect(() => connector.addAbi({})).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('getAbi()', () => {
    test('throws error', async () => {
      await expect(() => connector.getAbi('contractId')).rejects.toThrowError(
        'Cannot get contractId ABI for a predicate',
      );
    });
  });

  describe('hasAbi()', () => {
    test('throws error', async () => {
      await expect(() => connector.hasAbi('contractId')).rejects.toThrowError(
        'A predicate account cannot have an ABI',
      );
    });
  });

  describe('addNetwork()', () => {
    test('throws error', async () => {
      await expect(() => connector.addNetwork('')).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('selectNetwork()', () => {
    test('throws error', async () => {
      const network: Network = { url: '', chainId: 0 };
      await expect(() => connector.selectNetwork(network)).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });
});
