import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  type FuelABI,
  type Network,
  type TransactionRequestLike,
  TransactionType,
} from 'fuels';
import { FuelWalletConnector } from '../FuelWalletConnector';

const requestMock = vi.fn();

vi.mock('json-rpc-2.0', () => {
  return {
    JSONRPCClient: vi.fn().mockImplementation(() => ({
      request: requestMock,
    })),
  };
});

describe('FuelWalletConnector', () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  test('constructor initializes properties correctly', async () => {
    const connector = new FuelWalletConnector();
    expect(connector.name).toBe('Fuel Wallet');
    expect(connector.connected).toBe(false);
    expect(connector.installed).toBe(false);
  });

  describe('authentication', () => {
    test('should connect', async () => {
      const request = requestMock.mockReturnValue(Promise.resolve(true));

      const connector = new FuelWalletConnector();
      const result = await connector.connect();
      expect(request).toHaveBeenCalledWith('connect', {});
      expect(result).toBe(true);
    });

    test('should disconnect', async () => {
      const request = requestMock.mockReturnValue(Promise.resolve(true));

      const connector = new FuelWalletConnector();
      const result = await connector.disconnect();
      expect(result).toBe(true);
      expect(request).toHaveBeenCalledWith('disconnect', {});
    });

    test('should request accounts', async () => {
      const request = requestMock.mockReturnValue(
        Promise.resolve([
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
        ]),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.accounts();
      expect(result).toEqual([
        '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
      ]);
      expect(request).toHaveBeenCalledWith('accounts', {});
    });

    test('should request current account', async () => {
      const request = requestMock.mockReturnValue(
        Promise.resolve(
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
        ),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.currentAccount();
      expect(result).toBe(
        '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
      );
      expect(request).toHaveBeenCalledWith('currentAccount', {});
    });
  });

  describe('transactions', () => {
    test('should request sign message', async () => {
      const request = requestMock.mockReturnValue(
        Promise.resolve(
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
        ),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.signMessage(
        '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
        'hello',
      );
      expect(result).toBe(
        '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
      );
      expect(request).toHaveBeenCalledWith('signMessage', {
        address:
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
        message: 'hello',
      });
    });

    test('should require a message', async () => {
      const connector = new FuelWalletConnector();
      await expect(
        connector.signMessage(
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
          ' ',
        ),
      ).rejects.toThrowError('Message is required');
    });

    test('should request send transaction', async () => {
      const request = requestMock.mockReturnValue(
        Promise.resolve(
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
        ),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.sendTransaction(
        '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
        {
          type: TransactionType.Create,
        },
      );
      expect(result).toBe(
        '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
      );
      expect(request).toHaveBeenCalled();
    });

    test('should require a transaction', async () => {
      const connector = new FuelWalletConnector();
      await expect(
        connector.sendTransaction(
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
          null as unknown as TransactionRequestLike,
        ),
      ).rejects.toThrowError('Transaction is required');
    });
  });

  describe('assets', () => {
    test('should list assets', async () => {
      const request = requestMock.mockReturnValue(
        Promise.resolve([
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
        ]),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.assets();
      expect(result).toEqual([
        '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
      ]);
      expect(request).toHaveBeenCalledWith('assets', {});
    });
  });

  describe('ABI', () => {
    test('should get ABI', async () => {
      const request = requestMock.mockReturnValue(
        Promise.resolve(
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
        ),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.getABI(
        '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
      );
      expect(result).toBe(
        '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
      );
      expect(request).toHaveBeenCalledWith('getAbi', {
        contractId:
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
      });
    });

    test('should add ABI', async () => {
      const request = requestMock.mockReturnValue(Promise.resolve(true));

      const connector = new FuelWalletConnector();
      const result = await connector.addABI(
        '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
        {} as FuelABI,
      );
      expect(result).toBe(true);
      expect(request).toHaveBeenCalledWith('addAbi', {
        abiMap: {
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb':
            {},
        },
      });
    });

    test('should check if ABI exists', async () => {
      const request = requestMock.mockReturnValue(Promise.resolve(true));

      const connector = new FuelWalletConnector();
      const result = await connector.hasABI(
        '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
      );
      expect(result).toBe(true);
      expect(request).toHaveBeenCalledWith('getAbi', {
        contractId:
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
      });
    });
  });

  describe('networks', () => {
    test('should list networks', async () => {
      const networks: Network[] = [
        {
          chainId: 0,
          url: 'https://testnet.fuel.network/v1/graphql',
        },
      ];
      const request = requestMock.mockReturnValue(Promise.resolve(networks));

      const connector = new FuelWalletConnector();
      const result = await connector.networks();
      expect(result).toEqual(networks);
      expect(request).toHaveBeenCalledWith('networks', {});
    });

    test('should select network', async () => {
      const request = requestMock.mockReturnValue(Promise.resolve(true));

      const connector = new FuelWalletConnector();
      const result = await connector.selectNetwork({
        chainId: 0,
        url: 'https://testnet.fuel.network/v1/graphql',
      });
      expect(result).toBe(true);
      expect(request).toHaveBeenCalledWith('selectNetwork', {
        network: {
          chainId: 0,
          url: 'https://testnet.fuel.network/v1/graphql',
        },
      });
    });

    test('should return version', async () => {
      const request = requestMock.mockReturnValue(
        Promise.resolve(
          '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
        ),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.version();
      expect(result).toBe(
        '0x1DC6604C6943E7C618ecDeE1e815dD4051EBf0A0E822986F5550B960fF4126fb',
      );
      expect(request).toHaveBeenCalledWith('version', {
        app: '0.0.0',
        network: '0.0.0',
      });
    });
  });
});
