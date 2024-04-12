import path from 'node:path';
import { launchNodeAndGetWallets } from '@fuel-ts/account/test-utils';
import {
  type Asset,
  type Network,
  Provider,
  Wallet,
  WalletUnlocked,
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
import { mockedStorage } from './mockedStorage';

describe('Burner Wallet Connector', () => {
  const storageMock = mockedStorage;

  let fuelProvider: Provider;
  let connector: BurnerWalletConnector;

  let stopProvider: () => void;

  let wallet: WalletUnlocked;

  const chainConfigPath = path.join(__dirname, 'chainConfig.json');

  beforeAll(async () => {
    Object.defineProperty(global, 'sessionStorage', {
      value: storageMock,
    });

    Object.defineProperty(global, 'localStorage', {
      value: storageMock,
    });

    const { stop, provider } = await launchNodeAndGetWallets({
      launchNodeOptions: {
        args: ['--chain', chainConfigPath],
        loggingEnabled: false,
      },
    });

    fuelProvider = provider;
    stopProvider = stop;

    wallet = Wallet.generate({
      provider: fuelProvider,
    });
  });

  afterAll(() => {
    stopProvider?.();
  });

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();

    connector = new BurnerWalletConnector({
      fuelProvider,
      privateKey: wallet.privateKey,
    });
  });

  describe('constructor()', () => {
    test('creates a new BurnerWalletConnector instance', () => {
      expect(connector).to.be.an.instanceOf(BurnerWalletConnector);

      expect(connector.name).to.be.equal('Burner Wallet');
      expect(connector.connected).to.be.false;
      expect(connector.installed).to.be.false;
    });
  });

  describe('configFuelProvider()', () => {
    test('configures fuel provider', async () => {
      const config = {
        fuelProvider: fuelProvider,
      };

      await connector.configFuelProvider(config);

      expect(connector.burnerWalletProvider).to.be.equal(fuelProvider);
    });
  });

  describe('setupBurnerWallet()', () => {
    test('sets up burner wallet', async () => {
      await connector.setupBurnerWallet();

      expect(connector.burnerWallet).to.be.an.instanceOf(WalletUnlocked);
      expect(connector.burnerWalletProvider).to.be.an.instanceOf(Provider);
      expect(connector.burnerWalletPrivateKey).to.be.a('string');
    });

    test('sets up burner wallet with private key', async () => {
      const privateKey = wallet.privateKey;

      localStorage.setItem('burnerWalletPrivateKey', privateKey);

      await connector.setupBurnerWallet();

      expect(connector.burnerWallet).to.be.an.instanceOf(WalletUnlocked);
      expect(connector.burnerWalletProvider).to.be.an.instanceOf(Provider);
      expect(connector.burnerWalletPrivateKey).to.be.a('string');
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
      const connected = await connector.isConnected();

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

      expect(connected).to.be.false;
    });
  });

  describe('accounts()', () => {
    test('get accounts', async () => {
      await connector.connect();

      const accounts = await connector.accounts();

      expect(accounts).to.deep.equal([wallet.address.toString()]);
    });
  });

  describe('currentAccount()', () => {
    test('get current account', async () => {
      await connector.connect();

      const account = await connector.currentAccount();

      expect(account).to.be.equal(wallet.address.toString());
    });
  });

  describe('ping()', () => {
    test('returns true', async () => {
      const burnerWalletConnector = new BurnerWalletConnector();

      const ping = await burnerWalletConnector.ping();

      expect(ping).to.be.true;
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
