import { describe, expect, test } from 'vitest';

import { BurnerWalletConnector } from '../index';

describe('index', () => {
  test('should export BurnerWalletConnector', () => {
    expect(BurnerWalletConnector).toBeDefined();
  });
});
