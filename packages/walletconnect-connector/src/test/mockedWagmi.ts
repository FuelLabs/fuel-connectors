import { vi } from 'vitest';

vi.mock('@wagmi/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@wagmi/core')>();

  return {
    ...actual,
    getAccount: vi.fn(() => ({
      address: '0x1111111111111111111111111111111111111111' as `0x${string}`,
      addresses: ['0x1111111111111111111111111111111111111111'] as const,
      chain: undefined,
      chainId: undefined,
      connector: {},
      isConnected: true,
      isConnecting: false,
      isDisconnected: false,
      isReconnecting: false,
      status: 'connected',
    })),
  };
});
