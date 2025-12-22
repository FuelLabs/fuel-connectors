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
import { StoreManager } from '../StoreManager';
import { TestPredicatedConnector } from './testConnector';

describe('Bako Predicated Connector', () => {
  let fuelProvider: Provider;
  let stopProvider: () => void;
  let connector: TestPredicatedConnector;

  beforeAll(async () => {
    const { cleanup, provider } = await launchTestNode();

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
      const getProvidersSpy = vi
        // biome-ignore lint/suspicious/noExplicitAny: using any to mock function
        .spyOn(connector as any, '_getProviders')
        .mockResolvedValue({
          fuelProvider,
        });

      const getEvmAddressSpy = vi
        // biome-ignore lint/suspicious/noExplicitAny: using any to mock function
        .spyOn(connector as any, '_getCurrentEvmAddress')
        .mockReturnValue('0x1111111111111111111111111111111111111111');

      const getPersonalWalletSpy = vi
        .spyOn(StoreManager, 'getPersonalWallet')
        .mockReturnValue({
          address:
            '0x1111111111111111111111111111111111111111111111111111111111111111',
          // biome-ignore lint/suspicious/noExplicitAny: mocking with minimal required fields
          configurable: { SIGNER: '0x1111' } as any,
          version: '0.0.1',
        });

      const wallet = Wallet.generate({ provider: fuelProvider });

      // @ts-expect-error emitAccountChange is protected
      connector.emitAccountChange(wallet.address);

      // @ts-expect-error getPredicateVersions is protected
      const versions = connector.getPredicateVersions();
      // @ts-expect-error customPredicate is protected
      connector.customPredicate = Object.values(versions)[0].predicate;

      // @ts-expect-error setupPredicate is protected
      const predicateAccount = await connector.setupPredicate();

      expect(predicateAccount).toBeDefined();
      // @ts-expect-error predicateAccount is protected
      expect(connector.predicateAccount).toBe(predicateAccount);

      getProvidersSpy.mockRestore();
      getEvmAddressSpy.mockRestore();
      getPersonalWalletSpy.mockRestore();
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
