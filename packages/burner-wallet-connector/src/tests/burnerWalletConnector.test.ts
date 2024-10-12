import path from 'node:path';
import { type Asset, type Network, Provider, Wallet } from 'fuels';
import { launchTestNode } from 'fuels/test-utils';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { BurnerWalletConnector } from '../BurnerWalletConnector';
import { BURNER_WALLET_PRIVATE_KEY, TESTNET_URL } from '../constants';
import type { BurnerWalletConfig } from '../types';
import { createMockedStorage } from './mockedStorage';

const mockConfirm = vi.fn();
window.confirm = mockConfirm;

// Construct a burner wallet and ping to simulate real world
const getBurnerWallet = async (config: BurnerWalletConfig = {}) => {
  const connector = new BurnerWalletConnector(config);
  await connector.ping();
  return connector;
};

describe('Burner Wallet Connector', () => {
  let fuelProvider: Provider;
  let stopProvider: () => void;

  const snapshotPath = path.join(__dirname, '');

  beforeAll(async () => {
    process.env.GENESIS_SECRET =
      '0x6e48a022f9d4ae187bca4e2645abd62198ae294ee484766edbdaadf78160dc68';
    const { cleanup, provider } = await launchTestNode({
      nodeOptions: {
        args: ['--snapshot', snapshotPath],
        loggingEnabled: false,
        // use fixed port to don't conflict with other packages,
        port: '4000',
      },
    });

    fuelProvider = provider;
    stopProvider = cleanup;
  });

  afterAll(() => {
    stopProvider?.();
  });

  beforeEach(async () => {
    Object.defineProperty(global, 'localStorage', {
      value: createMockedStorage(),
    });
    mockConfirm.mockClear();
  });

  afterEach(async () => {
    global.localStorage.clear();
  });

  describe('constructor()', () => {
    test('Creates a new BurnerWalletConnector instance using default config', async () => {
      const connector = await getBurnerWallet({
        fuelProvider,
      });
      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);
      expect(connector.name).to.be.equal('Burner Wallet');
      expect(connector.connected).to.be.false;
      expect(connector.installed).to.be.true;
      expect(await connector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: fuelProvider.url,
      });
    });

    test('Creates a new BurnerWalletConnector instance with custom storage', async () => {
      const storage = createMockedStorage();
      const wallet = Wallet.generate();
      await storage.setItem(BURNER_WALLET_PRIVATE_KEY, wallet.privateKey);
      const config: BurnerWalletConfig = {
        storage,
      };
      const connector = await getBurnerWallet(config);

      mockConfirm.mockImplementationOnce(() => true);
      await connector.connect();
      expect(mockConfirm).toHaveBeenCalled();

      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);
      expect(await connector.currentAccount()).to.be.equal(
        wallet.address.toString(),
      );
    });

    test('Creates a new BurnerWalletConnector instance with config using sessionStorage', async () => {
      const storage = createMockedStorage();
      const wallet = Wallet.generate({
        provider: fuelProvider,
      });

      storage.setItem(BURNER_WALLET_PRIVATE_KEY, wallet.privateKey);

      const config: BurnerWalletConfig = {
        fuelProvider,
        storage,
      };
      const connector = await getBurnerWallet(config);

      mockConfirm.mockImplementationOnce(() => true);
      await connector.connect();
      expect(mockConfirm).toHaveBeenCalled();

      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);
      expect(await connector.currentAccount()).to.be.equal(
        wallet.address.toString(),
      );
    });

    test('Creates a new BurnerWalletConnector instance with sessionStorage when local storage has already been set', async () => {
      const storage = createMockedStorage();
      const wallet1 = Wallet.generate();
      const wallet2 = Wallet.generate();

      global.localStorage.setItem(
        BURNER_WALLET_PRIVATE_KEY,
        wallet1.privateKey,
      );

      storage.setItem(BURNER_WALLET_PRIVATE_KEY, wallet2.privateKey);

      const config: BurnerWalletConfig = {
        storage,
      };
      const connector = await getBurnerWallet(config);

      mockConfirm.mockImplementationOnce(() => true);
      await connector.connect();
      expect(mockConfirm).toHaveBeenCalled();

      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);
      expect(await connector.currentAccount()).to.be.equal(
        wallet2.address.toString(),
      );
    });

    test('Creates a new BurnerWalletConnector instance with non default Provider url', async () => {
      const nonDefaultProvider = await Provider.create(TESTNET_URL);

      const config: BurnerWalletConfig = {
        fuelProvider: nonDefaultProvider,
      };
      const connector = await getBurnerWallet(config);

      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);
      expect(await connector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: TESTNET_URL,
      });
    });

    test('Creates a new BurnerWalletConnector instance with non default Promise Provider url', async () => {
      const nonDefaultProvider = Provider.create(TESTNET_URL);

      const config: BurnerWalletConfig = {
        fuelProvider: nonDefaultProvider,
      };

      const connector = await getBurnerWallet(config);
      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);
      expect(await connector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: TESTNET_URL,
      });
    });
  });

  describe('connect()', () => {
    test('Connect to burner wallet', async () => {
      const connector = await getBurnerWallet();
      await connector.connect();

      const connectedAfterConnect = await connector.isConnected();
      expect(connectedAfterConnect).to.be.true;
    });

    test('Connect but generate a new private key', async () => {
      const storage = createMockedStorage();
      const wallet = Wallet.generate({
        provider: fuelProvider,
      });

      storage.setItem(BURNER_WALLET_PRIVATE_KEY, wallet.privateKey);

      const connector = await getBurnerWallet({
        storage,
      });

      mockConfirm.mockImplementationOnce(() => false);
      await connector.connect();
      expect(mockConfirm).toHaveBeenCalled();

      const connectedAfterConnect = await connector.isConnected();
      expect(connectedAfterConnect).to.be.true;
      expect(await connector.currentAccount()).to.not.be.equal(
        wallet.address.toString(),
      );
    });
  });

  describe('isConnected()', () => {
    test('false when not connected', async () => {
      const connector = await getBurnerWallet();
      const connected = await connector.isConnected();

      expect(connected).to.be.false;
    });

    test('true when connected', async () => {
      const wallet = Wallet.generate();
      global.localStorage.setItem(BURNER_WALLET_PRIVATE_KEY, wallet.privateKey);
      const connector = await getBurnerWallet();
      await connector.connect();
      const connected = await connector.isConnected();

      expect(connected).to.be.true;
    });
  });

  describe('disconnect()', () => {
    test('disconnect from burner wallet', async () => {
      const connector = await getBurnerWallet();
      await connector.connect();
      await connector.disconnect();

      const connected = await connector.isConnected();
      const privateKey = sessionStorage.getItem(BURNER_WALLET_PRIVATE_KEY);

      expect(connected).to.be.false;
      expect(privateKey).toBeNull();
    });
  });

  describe('accounts()', () => {
    test('throws error when not connected', async () => {
      const connector = await getBurnerWallet();

      await expect(() => connector.accounts()).rejects.toThrow(
        'Wallet not connected',
      );
    });

    test('get accounts', async () => {
      const connector = await getBurnerWallet();
      await connector.connect();

      const accounts = await connector.accounts();

      expect(accounts.length).to.be.eq(1);
    });
  });

  describe('currentAccount()', () => {
    test('throws error when not connected', async () => {
      const connector = await getBurnerWallet();

      await expect(() => connector.currentAccount()).rejects.toThrow(
        'Wallet not connected',
      );
    });

    test('get current account', async () => {
      const connector = await getBurnerWallet();
      await connector.connect();

      const account = await connector.currentAccount();

      expect(account?.length).to.be.equal(66);
    });
  });

  describe('network()', () => {
    test('returns fuel network info', async () => {
      const connector = await getBurnerWallet({
        fuelProvider,
      });
      await connector.connect();

      const network = await connector.currentNetwork();

      expect(network.chainId).to.be.equal(fuelProvider.getChainId());
      expect(network.url).to.be.equal(fuelProvider.url);
    });
  });

  describe('networks()', () => {
    test('returns an array of fuel network info', async () => {
      const connector = await getBurnerWallet({
        fuelProvider,
      });
      await connector.connect();

      const networks = await connector.networks();
      const network = networks.pop();

      const networkChainId = network?.chainId;
      const expectedChainId = fuelProvider.getChainId();

      expect(networks).to.be.an('array');

      expect(networkChainId).to.be.equal(expectedChainId);
      expect(network?.url).to.be.equal(fuelProvider.url);
    });
  });

  describe('assets()', () => {
    test('returns an empty array', async () => {
      const connector = await getBurnerWallet();
      expect(await connector.assets()).to.deep.equal([]);
    });
  });

  describe('addAsset()', () => {
    test('throws error', async () => {
      const connector = await getBurnerWallet();
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
      const connector = await getBurnerWallet();
      await expect(() => connector.addAssets([])).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('addAbi()', () => {
    test('throws error', async () => {
      const connector = await getBurnerWallet();
      await expect(() => connector.addAbi({})).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('getAbi()', () => {
    test('throws error', async () => {
      const connector = await getBurnerWallet();
      await expect(() => connector.getAbi('contractId')).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('hasAbi()', () => {
    test('throws error', async () => {
      const connector = await getBurnerWallet();

      await expect(
        async () => await connector.hasAbi('contractId'),
      ).rejects.toThrow('Method not implemented.');
    });
  });

  describe('addNetwork()', () => {
    test('throws error', async () => {
      const connector = await getBurnerWallet();
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
      const connector = await getBurnerWallet();
      await expect(() => connector.selectNetwork(network)).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });
});
