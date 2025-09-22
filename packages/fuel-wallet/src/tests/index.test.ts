import { describe, expect, test } from 'vitest';

import { FuelWalletConnector } from '../index';

describe('index', () => {
  test('should export FuelWalletConnector', () => {
    expect(FuelWalletConnector).toBeDefined();
  });
});
