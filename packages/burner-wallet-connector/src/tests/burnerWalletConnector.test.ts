import path from 'node:path';
import { launchNodeAndGetWallets } from '@fuel-ts/account/test-utils';
import {
  type Asset,
  type Network,
  type Provider,
  type StorageAbstract,
  Wallet,
} from 'fuels';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { BurnerWalletConnector } from '../BurnerWalletConnector';
import { BURNER_WALLET_PRIVATE_KEY } from '../constants';
import type { BurnerWalletConfig } from '../types';
import { createMockedStorage } from './mockedStorage';

describe('Burner Wallet Connector', () => {
  let fuelProvider: Provider;

  let stopProvider: () => void;

  const snapshotPath = path.join(__dirname, '');

  beforeAll(async () => {
    process.env.GENESIS_SECRET =
      '0x6e48a022f9d4ae187bca4e2645abd62198ae294ee484766edbdaadf78160dc68';
    const { stop, provider } = await launchNodeAndGetWallets({
      launchNodeOptions: {
        args: ['--snapshot', snapshotPath],
        loggingEnabled: false,
      },
    });
    BurnerWalletConnector.defaultProviderUrl = provider.url;

    fuelProvider = provider;
    stopProvider = stop;
  });

  afterAll(() => {
    stopProvider?.();
  });

  beforeEach(async () => {
    Object.defineProperty(global, 'localStorage', {
      value: createMockedStorage(),
    });
  });

  afterEach(async () => {
    global.localStorage.clear();
  });

  describe('constructor()', () => {
    test('Creates a new BurnerWalletConnector instance using default config', async () => {
      const connector = new BurnerWalletConnector();
      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);
      expect(connector.name).to.be.equal('Burner Wallet');
      expect(connector.connected).to.be.false;
      expect(connector.installed).to.be.false;
      expect(await connector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: fuelProvider.url,
      });
    });

    test('Creates a new BurnerWalletConnector instance with custom storage', async () => {
      const storage = createMockedStorage();
      const wallet = Wallet.generate();
      storage.setItem(BURNER_WALLET_PRIVATE_KEY, wallet.privateKey);
      const config: BurnerWalletConfig = {
        storage,
      };
      const connector = new BurnerWalletConnector(config);
      await connector.connect();

      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);
      expect(await connector.currentAccount()).to.be.equal(
        wallet.address.toString(),
      );
    });

    test('creates a new BurnerWalletConnector instance with config using sessionStorage', async () => {
      const storage = createMockedStorage();
      const wallet = Wallet.generate({
        provider: fuelProvider,
      });

      storage.setItem(BURNER_WALLET_PRIVATE_KEY, wallet.privateKey);

      const config: BurnerWalletConfig = {
        fuelProvider,
        storage,
      };
      const connector = new BurnerWalletConnector(config);
      await connector.connect();

      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);
      expect(await connector.currentAccount()).to.be.equal(
        wallet.address.toString(),
      );
    });
  });

  describe('connect()', () => {
    test('Connect to burner wallet', async () => {
      const connector = new BurnerWalletConnector();
      await connector.connect();

      const connectedAfterConnect = await connector.isConnected();
      expect(connectedAfterConnect).to.be.true;
    });
  });

  describe('isConnected()', () => {
    test('false when not connected', async () => {
      const connector = new BurnerWalletConnector();
      const connected = await connector.isConnected();

      expect(connected).to.be.false;
    });
    test('true when connected', async () => {
      const wallet = Wallet.generate();
      global.localStorage.setItem(BURNER_WALLET_PRIVATE_KEY, wallet.privateKey);
      const connector = new BurnerWalletConnector();
      await connector.connect();
      const connected = await connector.isConnected();

      expect(connected).to.be.true;
    });
  });

  describe('disconnect()', () => {
    test('disconnect from burner wallet', async () => {
      const connector = new BurnerWalletConnector();
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
      const connector = new BurnerWalletConnector();

      await expect(() => connector.accounts()).rejects.toThrow(
        'Wallet not connected',
      );
    });

    test('get accounts', async () => {
      const connector = new BurnerWalletConnector();
      await connector.connect();

      const accounts = await connector.accounts();

      expect(accounts.length).to.be.eq(1);
    });
  });

  describe('currentAccount()', () => {
    test('throws error when not connected', async () => {
      const connector = new BurnerWalletConnector();

      await expect(() => connector.currentAccount()).rejects.toThrow(
        'Wallet not connected',
      );
    });

    test('get current account', async () => {
      const connector = new BurnerWalletConnector();
      await connector.connect();

      const account = await connector.currentAccount();

      expect(account?.length).to.be.equal(63);
    });
  });

  describe('network()', () => {
    test('returns fuel network info', async () => {
      const connector = new BurnerWalletConnector();
      await connector.connect();

      const network = await connector.currentNetwork();

      expect(network.chainId).to.be.equal(fuelProvider.getChainId());
      expect(network.url).to.be.equal(fuelProvider.url);
    });
  });

  describe('networks()', () => {
    test('returns an array of fuel network info', async () => {
      const connector = new BurnerWalletConnector();
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
      const connector = new BurnerWalletConnector();
      expect(await connector.assets()).to.deep.equal([]);
    });
  });

  describe('addAsset()', () => {
    test('throws error', async () => {
      const connector = new BurnerWalletConnector();
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
      const connector = new BurnerWalletConnector();
      await expect(() => connector.addAssets([])).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('addAbi()', () => {
    test('throws error', async () => {
      const connector = new BurnerWalletConnector();
      await expect(() => connector.addAbi({})).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('getAbi()', () => {
    test('throws error', async () => {
      const connector = new BurnerWalletConnector();
      await expect(() => connector.getAbi('contractId')).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('hasAbi()', () => {
    test('throws error', async () => {
      const connector = new BurnerWalletConnector();

      await expect(
        async () => await connector.hasAbi('contractId'),
      ).rejects.toThrow('Method not implemented.');
    });
  });

  describe('addNetwork()', () => {
    test('throws error', async () => {
      const connector = new BurnerWalletConnector();
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
      const connector = new BurnerWalletConnector();
      await expect(() => connector.selectNetwork(network)).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });
});
