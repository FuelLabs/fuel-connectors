import { FueletWalletConnector } from '../FueletWalletConnector';

jest.mock('json-rpc-2.0', () => {
  return {
    JSONRPCClient: jest.fn().mockImplementation(() => ({
      request: jest.fn(),
    })),
  };
});

describe('FueletWalletConnector', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('constructor initializes properties correctly', async () => {
    const connector = new FueletWalletConnector();
    expect(connector.name).toBe('Fuelet Wallet');
    expect(connector.connected).toBe(false);
    expect(connector.installed).toBe(false);
  });
});
