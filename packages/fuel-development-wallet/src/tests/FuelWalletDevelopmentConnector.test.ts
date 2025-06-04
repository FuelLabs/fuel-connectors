import { describe, expect, test, vi } from 'vitest';

import { FuelWalletDevelopmentConnector } from '../FuelWalletDevelopmentConnector';

vi.mock('json-rpc-2.0', () => {
  return {
    JSONRPCClient: vi.fn().mockImplementation(() => ({
      request: vi.fn(),
    })),
  };
});

describe('FuelWalletDevelopmentConnector', () => {
  test('constructor initializes properties correctly', async () => {
    const connector = new FuelWalletDevelopmentConnector();
    expect(connector.name).toBe('Fuel Wallet Development');
    expect(connector.installed).toBe(false);
    expect(connector.connected).toBe(false);
  });
});
