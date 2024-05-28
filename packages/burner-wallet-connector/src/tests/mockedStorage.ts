import type { StorageAbstract } from 'fuels';

export const createMockedStorage: () => StorageAbstract = () => {
  let store: Record<string, string> = {};

  return {
    getItem: async (key: string): Promise<string> => store[key] ?? null,
    setItem: async (key: string, value: string): Promise<void> => {
      store[key] = value.toString();
    },
    removeItem: async (key: string): Promise<void> => {
      delete store[key];
    },
    clear: async (): Promise<void> => {
      store = {};
    },
  };
};
