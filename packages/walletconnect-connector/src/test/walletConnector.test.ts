import type { Asset, Network } from 'fuels';
import { beforeEach, describe, expect, test } from 'vitest';
import { WalletConnectConnector } from '../WalletConnectConnector';

describe('WalletConnect Connector', () => {
  let connector: WalletConnectConnector;

  beforeEach(async () => {
    // Class contains state, reset the state for each test
    connector = new WalletConnectConnector({ projectId: '0000' });
  });

  describe('constructor()', () => {
    test('initialize properties correctly', () => {
      const walletWalletConnector = new WalletConnectConnector({
        projectId: '0000',
      });

      expect(walletWalletConnector.name).to.equal('Ethereum Wallets');
      expect(walletWalletConnector.connected).to.be.false;
      expect(walletWalletConnector.installed).to.be.false;
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
