import { FuelWalletDevelopmentConnector } from '../FuelWalletDevelopmentConnector';

jest.mock('json-rpc-2.0', () => {
  return {
    JSONRPCClient: jest.fn().mockImplementation(() => ({
      request: jest.fn(),
    })),
  };
});

describe('FuelWalletDevelopmentConnector', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('constructor initializes properties correctly', async () => {
    const connector = new FuelWalletDevelopmentConnector();
    expect(connector.name).toBe('Fuel Wallet Development');
    expect(connector.connected).toBe(false);
    expect(connector.installed).toBe(false);
  });
});
