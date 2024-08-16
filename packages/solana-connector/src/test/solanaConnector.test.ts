import path from 'node:path';
import { hexToBytes } from '@ethereumjs/util';
import { PredicateFactory } from '@fuel-connectors/common';
import { launchNodeAndGetWallets } from '@fuel-ts/account/test-utils';
import { type Asset, type Network, Provider } from 'fuels';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { SolanaConnector } from '../SolanaConnector';
import { TESTNET_URL } from '../constants';
import { PREDICATE_VERSIONS } from './mockedPredicate';

describe('Solana Connector', () => {
  const predicate = Object.values(PREDICATE_VERSIONS)[0]?.predicate;
  const projectId = '0000';
  const snapshotPath = path.join(__dirname, '');

  let connector = connectorFactory({ projectId });
  let fuelProvider: Provider;
  let stopProvider: () => void;

  function connectorFactory(
    props?: Partial<ConstructorParameters<typeof SolanaConnector>[0]>,
  ) {
    return new SolanaConnector({ ...props });
  }

  beforeAll(async () => {
    process.env.GENESIS_SECRET =
      '0x6e48a022f9d4ae187bca4e2645abd62198ae294ee484766edbdaadf78160dc68';
    const { stop, provider } = await launchNodeAndGetWallets({
      launchNodeOptions: {
        args: ['--snapshot', snapshotPath],
        loggingEnabled: false,
        // use fixed port to don't conflict with other packages,
        port: '4002',
      },
    });

    fuelProvider = provider;
    stopProvider = stop;
  });

  afterAll(() => {
    stopProvider?.();
  });

  beforeEach(() => {
    // Class contains state, reset the state for each test
    connector = connectorFactory({ projectId });
  });

  describe('constructor()', () => {
    test('initialize properties correctly', async () => {
      const solanaConnector = connectorFactory();
      await solanaConnector.ping();

      expect(solanaConnector).to.be.an.instanceOf(SolanaConnector);
      expect(solanaConnector.name).to.equal('Solana Wallets');
      expect(solanaConnector.connected).to.be.false;
      expect(solanaConnector.installed).to.be.false;
      expect(await solanaConnector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: TESTNET_URL,
      });
    });

    test('can construct a SolanaConnector with a non default Provider', async () => {
      const nonDefaultProvider = fuelProvider;
      const solanaConnector = connectorFactory({
        fuelProvider: nonDefaultProvider,
      });
      await solanaConnector.ping();

      expect(solanaConnector).to.be.an.instanceOf(SolanaConnector);
      expect(solanaConnector.name).to.equal('Solana Wallets');
      expect(solanaConnector.connected).to.be.false;
      expect(solanaConnector.installed).to.be.false;
      expect(await solanaConnector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: fuelProvider.url,
      });
    });

    test('can construct a SolanaConnector with a non default Promise Provider', async () => {
      const nonDefaultProvider = Provider.create(fuelProvider.url);
      const solanaConnector = connectorFactory({
        fuelProvider: nonDefaultProvider,
      });
      await solanaConnector.ping();

      expect(solanaConnector).to.be.an.instanceOf(SolanaConnector);
      expect(solanaConnector.name).to.equal('Solana Wallets');
      expect(solanaConnector.connected).to.be.false;
      expect(solanaConnector.installed).to.be.false;
      expect(await solanaConnector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: fuelProvider.url,
      });
    });
  });

  describe('setupPredicate()', () => {
    test('should setup predicate with given config', async () => {
      const solanaConnector = connectorFactory({
        predicateConfig: predicate,
      });

      // @ts-expect-error predicateConfig is protected
      const predicateAccount = await solanaConnector.setupPredicate();

      expect(predicateAccount).to.be.instanceOf(PredicateFactory);
    });

    test('Should setup predicate without given config', async () => {
      const solanaConnector = connectorFactory();

      // @ts-expect-error predicateConfig is protected
      const predicateAccount = await solanaConnector.setupPredicate();

      expect(predicateAccount).to.be.instanceOf(PredicateFactory);
    });
  });

  describe('currentAccount()', () => {
    test('throws error', () => {
      // @ts-expect-error currentAccount is protected
      expect(connector.getAccountAddress()).toBeNull();
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
