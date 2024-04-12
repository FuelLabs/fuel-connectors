import { type Asset, type Network, Provider } from 'fuels';
import { BurnerWalletConnector } from 'src/BurnerWalletConnector';
import { BETA_5_URL } from 'src/constants';
import { beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { mockedStorage } from './mockedStorage';
import { WALLET_WITH_COINS } from './wallets';

describe('Burner Wallet Connector', () => {
  const storageMock = mockedStorage;

  let connector: BurnerWalletConnector;

  beforeAll(() => {
    Object.defineProperty(global, 'sessionStorage', {
      value: storageMock,
    });

    Object.defineProperty(global, 'localStorage', {
      value: storageMock,
    });
  });

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();

    connector = new BurnerWalletConnector({
      privateKey: WALLET_WITH_COINS.privateKey,
      fuelProvider: await Provider.create(BETA_5_URL),
    });
  });

  describe('connect()', () => {
    test('connect to burner wallet', async () => {
      await connector.connect();

      const connected = await connector.isConnected();

      expect(connected).to.be.true;
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

      expect(accounts).to.deep.equal([WALLET_WITH_COINS.address]);
    });
  });

  describe('currentAccount()', () => {
    test('get current account', async () => {
      await connector.connect();

      const account = await connector.currentAccount();

      expect(account).to.equal(WALLET_WITH_COINS.address);
    });
  });

  describe('ping()', () => {
    test('returns true', async () => {
      const ping = await connector.ping();

      expect(ping).to.be.true;
    });
  });

  describe('network()', () => {
    test('returns fuel network info', async () => {
      await connector.connect();

      const network = await connector.currentNetwork();

      const provider = await Provider.create(BETA_5_URL);

      expect(network.chainId).to.be.equal(
        Number((await provider.getNetwork()).chainId),
      );
      expect(network.url).to.be.equal(BETA_5_URL);
    });
  });

  describe('networks()', () => {
    test('returns an array of fuel network info', async () => {
      const provider = await Provider.create(BETA_5_URL);
      await connector.connect();

      const networks = await connector.networks();
      const network = networks.pop();

      const networkChainId = network?.chainId;
      const connectorNetwork = await provider.getNetwork();
      const expectedChainId = connectorNetwork
        ? Number(connectorNetwork.chainId)
        : undefined;

      expect(networks).to.be.an('array');

      expect(networkChainId).to.be.equal(expectedChainId);
      expect(network?.url).to.be.equal(BETA_5_URL);
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
      await expect(() => connector.hasAbi('contractId')).rejects.toThrowError(
        'Method not implemented.',
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
