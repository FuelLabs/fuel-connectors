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
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { BurnerWalletConnector } from '../BurnerWalletConnector';
import { BURNER_WALLET_PRIVATE_KEY } from '../constants';
import type { BurnerWalletConfig } from '../types';
import { mockedStorage } from './mockedStorage';

describe('Burner Wallet Connector', () => {
  let fuelProvider: Provider;
  let connector: BurnerWalletConnector;

  let stopProvider: () => void;

  const chainConfigPath = path.join(__dirname, 'chainConfig.json');

  beforeAll(async () => {
    Object.defineProperty(global, 'sessionStorage', {
      value: mockedStorage,
    });

    Object.defineProperty(global, 'localStorage', {
      value: mockedStorage,
    });

    process.env.GENESIS_SECRET =
      '0x6e48a022f9d4ae187bca4e2645abd62198ae294ee484766edbdaadf78160dc68';
    const { stop, provider } = await launchNodeAndGetWallets({
      launchNodeOptions: {
        args: ['--chain', chainConfigPath],
        loggingEnabled: false,
      },
    });

    fuelProvider = provider;
    stopProvider = stop;
  });

  afterAll(() => {
    stopProvider?.();
  });

  beforeEach(async () => {
    connector = new BurnerWalletConnector({
      fuelProvider,
    });
  });

  describe('constructor()', () => {
    test('creates a new BurnerWalletConnector instance', () => {
      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);

      expect(connector.name).to.be.equal('Burner Wallet');
      expect(connector.connected).to.be.false;
      expect(connector.installed).to.be.false;
    });

    test('creates a new BurnerWalletConnector instance with config using localStorage', async () => {
      const wallet = Wallet.generate({
        provider: fuelProvider,
      });

      localStorage.setItem(BURNER_WALLET_PRIVATE_KEY, wallet.privateKey);

      const config: BurnerWalletConfig = {
        fuelProvider,
        storage: localStorage as unknown as StorageAbstract,
      };
      const connector = new BurnerWalletConnector(config);
      await connector.connect();

      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);
      expect(connector.burnerWalletPrivateKey).to.be.equal(wallet.privateKey);
    });

    test('creates a new BurnerWalletConnector instance with config using sessionStorage', async () => {
      const wallet = Wallet.generate({
        provider: fuelProvider,
      });

      sessionStorage.setItem(BURNER_WALLET_PRIVATE_KEY, wallet.privateKey);

      const config: BurnerWalletConfig = {
        fuelProvider,
        storage: sessionStorage as unknown as StorageAbstract,
      };
      const connector = new BurnerWalletConnector(config);
      await connector.connect();

      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);
      expect(connector.burnerWalletPrivateKey).to.be.equal(wallet.privateKey);
    });
  });

  describe('connect()', () => {
    test('connect to burner wallet', async () => {
      await connector.connect();

      const connectedAfterConnect = await connector.isConnected();
      expect(connectedAfterConnect).to.be.true;
    });
  });

  describe('isConnected()', () => {
    test('false when not connected', async () => {
      const burnerWalletConnector = new BurnerWalletConnector();
      const connected = await burnerWalletConnector.isConnected();

      expect(connected).to.be.false;
    });
    test('true when connected', async () => {
      await connector.connect();
      const connected = await connector.isConnected();

      expect(connected).to.be.true;
    });
  });

  describe('disconnect()', () => {
    test('disconnect from burner wallet', async () => {
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
      const burnerWalletConnector = new BurnerWalletConnector();

      await expect(() => burnerWalletConnector.accounts()).rejects.toThrow(
        'Wallet not connected',
      );
    });

    test('get accounts', async () => {
      await connector.connect();

      const accounts = await connector.accounts();

      expect(accounts).to.deep.equal([
        connector.burnerWallet?.address.toString(),
      ]);
    });
  });

  describe('currentAccount()', () => {
    test('throws error when not connected', async () => {
      const burnerWalletConnector = new BurnerWalletConnector();

      await expect(() =>
        burnerWalletConnector.currentAccount(),
      ).rejects.toThrow('Wallet not connected');
    });

    test('get current account', async () => {
      await connector.connect();

      const account = await connector.currentAccount();

      expect(account).to.be.equal(connector.burnerWallet?.address.toString());
    });
  });

  describe('network()', () => {
    test('returns fuel network info', async () => {
      await connector.connect();

      const network = await connector.currentNetwork();

      expect(network.chainId).to.be.equal(
        Number((await fuelProvider.getNetwork()).chainId),
      );
      expect(network.url).to.be.equal(fuelProvider.url);
    });
  });

  describe('networks()', () => {
    test('returns an array of fuel network info', async () => {
      await connector.connect();

      const networks = await connector.networks();
      const network = networks.pop();

      const networkChainId = network?.chainId;
      const connectorNetwork = await fuelProvider.getNetwork();
      const expectedChainId = connectorNetwork
        ? Number(connectorNetwork.chainId)
        : undefined;

      expect(networks).to.be.an('array');

      expect(networkChainId).to.be.equal(expectedChainId);
      expect(network?.url).to.be.equal(fuelProvider.url);
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
      await expect(() => connector.selectNetwork(network)).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });
});
