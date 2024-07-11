import path from 'node:path';
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

describe('Solana Connector', () => {
  let connector: SolanaConnector;

  const snapshotPath = path.join(__dirname, '');

  let fuelProvider: Provider;

  let stopProvider: () => void;

  beforeAll(async () => {
    process.env.GENESIS_SECRET =
      '0x6e48a022f9d4ae187bca4e2645abd62198ae294ee484766edbdaadf78160dc68';
    const { stop, provider } = await launchNodeAndGetWallets({
      launchNodeOptions: {
        args: ['--snapshot', snapshotPath],
        loggingEnabled: false,
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
    connector = new SolanaConnector({ projectId: '0000' });
  });

  describe('constructor()', () => {
    test('initialize properties correctly', async () => {
      const solanaConnector = new SolanaConnector({
        projectId: '0000',
      });
      await solanaConnector.ping();

      expect(solanaConnector).to.be.an.instanceOf(SolanaConnector);
      expect(solanaConnector.name).to.equal('Solana Wallets');
      expect(await solanaConnector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: TESTNET_URL,
      });
    });

    test('it can instantiate SolanaConnector with a non default Provider', async () => {
      const nonDefaultProvider = fuelProvider;
      const solanaConnector = new SolanaConnector({
        fuelProvider: nonDefaultProvider,
        projectId: '0000',
      });
      await solanaConnector.ping();

      expect(solanaConnector).to.be.an.instanceOf(SolanaConnector);
      expect(solanaConnector.name).to.equal('Solana Wallets');
      expect(await solanaConnector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: TESTNET_URL,
      });
    });

    test('it can instantiate SolanaConnector with a non default Promise Provider', async () => {
      const nonDefaultProvider = Provider.create(fuelProvider.url);
      const solanaConnector = new SolanaConnector({
        fuelProvider: nonDefaultProvider,
        projectId: '0000',
      });
      await solanaConnector.ping();

      expect(solanaConnector).to.be.an.instanceOf(SolanaConnector);
      expect(solanaConnector.name).to.equal('Solana Wallets');
      expect(await solanaConnector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: TESTNET_URL,
      });
    });
  });

  describe('isConnected()', () => {
    test('false when not connected', async () => {
      const connector = new SolanaConnector();

      const connectedAfterConnect = await connector.isConnected();
      expect(connectedAfterConnect).to.be.false;
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

  describe('currentNetwork()', () => {
    test('returns fuel network', async () => {
      const network = await connector.currentNetwork();

      expect(network.url).to.equal(connector.fuelProvider?.url);
      expect(network.chainId).to.equal(connector.fuelProvider?.getChainId());
    });
  });
});