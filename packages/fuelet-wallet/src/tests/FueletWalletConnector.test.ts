import { describe, expect, test, vi } from 'vitest';

import { FueletWalletConnector } from '../FueletWalletConnector';

vi.mock('json-rpc-2.0', () => {
  return {
    JSONRPCClient: vi.fn().mockImplementation(() => ({
      request: vi.fn(),
    })),
  };
});

describe('FueletWalletConnector', () => {
  test('constructor initializes properties correctly', async () => {
    const connector = new FueletWalletConnector();
    expect(connector.name).toBe('Fuelet Wallet');
    expect(connector.connected).toBe(false);
    expect(connector.installed).toBe(false);
  });
});
