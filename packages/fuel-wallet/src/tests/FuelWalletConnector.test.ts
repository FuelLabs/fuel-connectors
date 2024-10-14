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
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
        ]),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.accounts();
      expect(result).toEqual([
        '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
      ]);
      expect(request).toHaveBeenCalledWith('accounts', {});
    });

    test('should request current account', async () => {
      const request = requestMock.mockReturnValue(
        Promise.resolve(
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
        ),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.currentAccount();
      expect(result).toBe(
        '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
      );
      expect(request).toHaveBeenCalledWith('currentAccount', {});
    });
  });

  describe('transactions', () => {
    test('should request sign message', async () => {
      const request = requestMock.mockReturnValue(
        Promise.resolve(
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
        ),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.signMessage(
        '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
        'hello',
      );
      expect(result).toBe(
        '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
      );
      expect(request).toHaveBeenCalledWith('signMessage', {
        address:
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
        message: 'hello',
      });
    });

    test('should require a message', async () => {
      const connector = new FuelWalletConnector();
      await expect(
        connector.signMessage(
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
          ' ',
        ),
      ).rejects.toThrowError('Message is required');
    });

    test('should request send transaction', async () => {
      const request = requestMock.mockReturnValue(
        Promise.resolve(
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
        ),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.sendTransaction(
        '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
        {
          type: TransactionType.Create,
        },
      );
      expect(result).toBe(
        '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
      );
      expect(request).toHaveBeenCalled();
    });

    test('should require a transaction', async () => {
      const connector = new FuelWalletConnector();
      await expect(
        connector.sendTransaction(
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
          null as unknown as TransactionRequestLike,
        ),
      ).rejects.toThrowError('Transaction is required');
    });
  });

  describe('assets', () => {
    test('should list assets', async () => {
      const request = requestMock.mockReturnValue(
        Promise.resolve([
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
        ]),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.assets();
      expect(result).toEqual([
        '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
      ]);
      expect(request).toHaveBeenCalledWith('assets', {});
    });
  });

  describe('ABI', () => {
    test('should get ABI', async () => {
      const request = requestMock.mockReturnValue(
        Promise.resolve(
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
        ),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.getABI(
        '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
      );
      expect(result).toBe(
        '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
      );
      expect(request).toHaveBeenCalledWith('getAbi', {
        contractId:
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
      });
    });

    test('should add ABI', async () => {
      const request = requestMock.mockReturnValue(Promise.resolve(true));

      const connector = new FuelWalletConnector();
      const result = await connector.addABI(
        '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
        {} as FuelABI,
      );
      expect(result).toBe(true);
      expect(request).toHaveBeenCalledWith('addAbi', {
        abiMap: {
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB':
            {},
        },
      });
    });

    test('should check if ABI exists', async () => {
      const request = requestMock.mockReturnValue(Promise.resolve(true));

      const connector = new FuelWalletConnector();
      const result = await connector.hasABI(
        '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
      );
      expect(result).toBe(true);
      expect(request).toHaveBeenCalledWith('getAbi', {
        contractId:
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
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
          '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
        ),
      );

      const connector = new FuelWalletConnector();
      const result = await connector.version();
      expect(result).toBe(
        '0x1DC6604C6943e7C618ECDee1e815dd4051ebf0a0E822986F5550B960fF4126FB',
      );
      expect(request).toHaveBeenCalledWith('version', {
        app: '0.0.0',
        network: '0.0.0',
      });
    });
  });
});
