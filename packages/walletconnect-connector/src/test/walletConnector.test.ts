import { EventsController } from '@web3modal/core';
import { type Asset, type Network, Provider } from 'fuels';
import { beforeEach, describe, expect, test } from 'vitest';
import { WalletConnectConnector } from '../WalletConnectConnector';
import { TESTNET_URL } from '../constants';
import { PredicateAccount } from '../utils/Predicate';
import { VERSIONS } from './mocked-versions/versions-dictionary';

const NON_DEFAULT_URL = 'http://localhost:4000/v1/graphql';

describe('WalletConnect Connector', () => {
  let connector: WalletConnectConnector;

  beforeEach(async () => {
    // Class contains state, reset the state for each test
    connector = new WalletConnectConnector({ projectId: '0000' });
  });

  describe('constructor()', () => {
    test('initialize properties correctly', async () => {
      const walletWalletConnector = new WalletConnectConnector({
        projectId: '0000',
      });
      await walletWalletConnector.ping();

      expect(walletWalletConnector).to.be.an.instanceOf(WalletConnectConnector);
      expect(walletWalletConnector.name).to.equal('Ethereum Wallets');
      expect(walletWalletConnector.connected).to.be.false;
      expect(walletWalletConnector.installed).to.be.false;
      expect(await walletWalletConnector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: TESTNET_URL,
      });
    });

    test('can construct a WalletConnectConnector with a non default Provider', async () => {
      const nonDefaultProvider = await Provider.create(NON_DEFAULT_URL);
      const walletWalletConnector = new WalletConnectConnector({
        fuelProvider: nonDefaultProvider,
        projectId: '0000',
      });
      await walletWalletConnector.ping();

      expect(walletWalletConnector).to.be.an.instanceOf(WalletConnectConnector);
      expect(walletWalletConnector.name).to.equal('Ethereum Wallets');
      expect(walletWalletConnector.connected).to.be.false;
      expect(walletWalletConnector.installed).to.be.false;
      expect(await walletWalletConnector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: NON_DEFAULT_URL,
      });
    });

    test('can construct a WalletConnectConnector with a non default Promise Provider', async () => {
      const nonDefaultProvider = Provider.create(NON_DEFAULT_URL);
      const walletWalletConnector = new WalletConnectConnector({
        fuelProvider: nonDefaultProvider,
        projectId: '0000',
      });
      await walletWalletConnector.ping();

      expect(walletWalletConnector).to.be.an.instanceOf(WalletConnectConnector);
      expect(walletWalletConnector.name).to.equal('Ethereum Wallets');
      expect(walletWalletConnector.connected).to.be.false;
      expect(walletWalletConnector.installed).to.be.false;
      expect(await walletWalletConnector.currentNetwork()).to.be.deep.equal({
        chainId: 0,
        url: NON_DEFAULT_URL,
      });
    });
  });

  describe('isConnected()', () => {
    test('false when not connected', async () => {
      const connector = new WalletConnectConnector();

      const connectedAfterConnect = await connector.isConnected();
      expect(connectedAfterConnect).to.be.false;
    });
  });

  describe('currenctAccount()', () => {
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

      const walletConectconnector = new WalletConnectConnector({
        predicateConfig: VERSIONS[version].predicate,
      });

      const predicateAccount = await walletConectconnector.setupPredicate();

      expect(predicateAccount).to.be.instanceOf(PredicateAccount);
    });

    test('Should setup predicate without given config', async () => {
      const walletConectconnector = new WalletConnectConnector();

      const predicateAccount = await walletConectconnector.setupPredicate();

      expect(predicateAccount).to.be.instanceOf(PredicateAccount);
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
