import { describe, expect, test } from 'vitest';

import { ArcanaWalletConnector } from '../index';

describe('index', () => {
  test('should export FueletWalletConnector', () => {
    expect(ArcanaWalletConnector).toBeDefined();
  });
});
