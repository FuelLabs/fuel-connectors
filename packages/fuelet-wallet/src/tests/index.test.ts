import { describe, expect, test } from 'vitest';

import { FueletWalletConnector } from '../index';

describe('index', () => {
  test('should export FueletWalletConnector', () => {
    expect(FueletWalletConnector).toBeDefined();
  });
});
