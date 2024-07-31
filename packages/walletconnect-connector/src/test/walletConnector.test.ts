import path from 'node:path';
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
import { WalletConnectConnector } from '../WalletConnectConnector';
import { TESTNET_URL } from '../constants';
import { VERSIONS } from './mocked-versions/versions-dictionary';

describe('WalletConnect Connector', () => {
  let connector: WalletConnectConnector;

  const snapshotPath = path.join(__dirname, '');

  let fuelProvider: Provider;

  let stopProvider: () => void;

  function connectorFactory(
    props?: Partial<ConstructorParameters<typeof WalletConnectConnector>[0]>,
  ) {
    return new WalletConnectConnector({ ...props });
  }

  beforeAll(async () => {
    process.env.GENESIS_SECRET =
      '0x6e48a022f9d4ae187bca4e2645abd62198ae294ee484766edbdaadf78160dc68';
    const { stop, provider } = await launchNodeAndGetWallets({
      launchNodeOptions: {
        args: ['--snapshot', snapshotPath],
        loggingEnabled: false,
        // use fixed port to don't conflict with other packages,
        port: '4003',
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
    connector = connectorFactory({ projectId: '0000' });
  });

  describe('constructor()', () => {
    test('initialize properties correctly', async () => {
      const walletWalletConnector = connectorFactory();
      await walletWalletConnector.ping();

      expect(walletWalletConnector).to.be.an.instanceOf(WalletConnectConnector);
      expect(walletWalletConnector.name).to.equal('Ethereum Wallets');
      expect(walletWalletConnector.connected).to.be.false;
      expect(walletWalletConnector.installed).to.be.true;
      expect(await walletWalletConnector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: TESTNET_URL,
      });
    });

    test('can construct a WalletConnectConnector with a non default Provider', async () => {
      const nonDefaultProvider = fuelProvider;
      const walletWalletConnector = connectorFactory({
        fuelProvider: nonDefaultProvider,
      });
      await walletWalletConnector.ping();

      expect(walletWalletConnector).to.be.an.instanceOf(WalletConnectConnector);
      expect(walletWalletConnector.name).to.equal('Ethereum Wallets');
      expect(walletWalletConnector.connected).to.be.false;
      expect(walletWalletConnector.installed).to.be.true;
      expect(await walletWalletConnector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: fuelProvider.url,
      });
    });

    test('can construct a WalletConnectConnector with a non default Promise Provider', async () => {
      const nonDefaultProvider = Provider.create(fuelProvider.url);
      const walletWalletConnector = connectorFactory({
        fuelProvider: nonDefaultProvider,
      });
      await walletWalletConnector.ping();

      expect(walletWalletConnector).to.be.an.instanceOf(WalletConnectConnector);
      expect(walletWalletConnector.name).to.equal('Ethereum Wallets');
      expect(walletWalletConnector.connected).to.be.false;
      expect(walletWalletConnector.installed).to.be.true;
      expect(await walletWalletConnector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: fuelProvider.url,
      });
    });
  });

  describe('isConnected()', () => {
    test('false when not connected', async () => {
      const connector = connectorFactory();

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

  describe('setupPredicate()', () => {
    test('should setup predicate with given config', async () => {
      const version =
        '0x4a45483e0309350adb9796f7b9f4a4af263a6b03160e52e8c9df9f22d11b4f33';

      const walletConectconnector = connectorFactory({
        predicateConfig: VERSIONS[version].predicate,
      });

      // @ts-expect-error predicateConfig is protected
      const predicateAccount = await walletConectconnector.setupPredicate();

      expect(predicateAccount).to.be.instanceOf(PredicateFactory);
    });

    test('Should setup predicate without given config', async () => {
      const walletConectconnector = connectorFactory();

      // @ts-expect-error predicateConfig is protected
      const predicateAccount = await walletConectconnector.setupPredicate();

      expect(predicateAccount).to.be.instanceOf(PredicateFactory);
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

      // @ts-expect-error fuelProvider is private
      expect(network.url).to.equal(connector.fuelProvider?.url);
      // @ts-expect-error fuelProvider is private
      expect(network.chainId).to.equal(connector.fuelProvider?.getChainId());
    });
  });
});
