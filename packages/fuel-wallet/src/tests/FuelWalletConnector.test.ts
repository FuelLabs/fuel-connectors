import { Mock, describe, expect, test, vi } from 'vitest';

import { TransactionType } from 'fuels';
import { JSONRPCClient } from 'json-rpc-2.0';
import { FuelWalletConnector } from '../FuelWalletConnector';

vi.mock('json-rpc-2.0', () => {
  return {
    JSONRPCClient: vi.fn().mockImplementation(() => ({
      request: vi.fn(),
    })),
  };
});

const JSONRPCClientMock = JSONRPCClient as Mock;

describe('FuelWalletConnector', () => {
  test('constructor initializes properties correctly', async () => {
    const connector = new FuelWalletConnector();
    expect(connector.name).toBe('Fuel Wallet');
    expect(connector.connected).toBe(false);
    expect(connector.installed).toBe(false);
  });

  test('should connect', async () => {
    const request = vi.fn().mockImplementation(() => Promise.resolve(true));
    JSONRPCClientMock.mockReturnValueOnce({
      request,
    });

    const connector = new FuelWalletConnector();
    const result = await connector.connect();
    expect(request).toHaveBeenCalledWith('connect', {});
    expect(result).toBe(true);
  });

  test('should disconnect', async () => {
    const request = vi.fn().mockImplementation(() => Promise.resolve(true));
    JSONRPCClientMock.mockReturnValueOnce({
      request,
    });

    const connector = new FuelWalletConnector();
    const result = await connector.disconnect();
    expect(result).toBe(true);
    expect(request).toHaveBeenCalledWith('disconnect', {});
  });

  test('should request accounts', async () => {
    const request = vi
      .fn()
      .mockImplementation(() => Promise.resolve(['0x123']));
    JSONRPCClientMock.mockReturnValueOnce({
      request,
    });

    const connector = new FuelWalletConnector();
    const result = await connector.accounts();
    expect(result).toEqual(['0x123']);
    expect(request).toHaveBeenCalledWith('accounts', {});
  });

  test('should request current account', async () => {
    const request = vi.fn().mockImplementation(() => Promise.resolve('0x123'));
    JSONRPCClientMock.mockReturnValueOnce({
      request,
    });

    const connector = new FuelWalletConnector();
    const result = await connector.currentAccount();
    expect(result).toBe('0x123');
    expect(request).toHaveBeenCalledWith('currentAccount', {});
  });

  test('should request sign message', async () => {
    const request = vi.fn().mockImplementation(() => Promise.resolve('0x123'));
    JSONRPCClientMock.mockReturnValueOnce({
      request,
    });

    const connector = new FuelWalletConnector();
    const result = await connector.signMessage('0x123', 'hello');
    expect(result).toBe('0x123');
    expect(request).toHaveBeenCalledWith('signMessage', {
      address: '0x123',
      message: 'hello',
    });
  });

  test('should request send transaction', async () => {
    const request = vi.fn().mockImplementation(() => Promise.resolve('0x123'));
    JSONRPCClientMock.mockReturnValueOnce({
      request,
    });

    const connector = new FuelWalletConnector();
    const result = await connector.sendTransaction('0x123', {
      type: TransactionType.Create,
      gasPrice: 100,
    });
    expect(result).toBe('0x123');
    expect(request).toHaveBeenCalled();
  });
});
