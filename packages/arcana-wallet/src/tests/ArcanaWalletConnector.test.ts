import { describe, expect, test, vi } from 'vitest';

import { ArcanaWalletConnector } from '../ArcanaWalletConnector';

vi.mock('json-rpc-2.0', () => {
  return {
    JSONRPCClient: vi.fn().mockImplementation(() => ({
      request: vi.fn(),
    })),
  };
});

describe('ArcanaWalletConnector', () => {
  test('constructor initializes properties correctly', async () => {
    const connector = new ArcanaWalletConnector();
    expect(connector.name).toBe('Arcana Wallet');
    expect(connector.connected).toBe(false);
    expect(connector.installed).toBe(false);
  });
});
