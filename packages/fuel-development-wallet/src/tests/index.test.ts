import { describe, expect, test } from 'vitest';

import { FuelWalletDevelopmentConnector } from '../index';

describe('index', () => {
  test('should export FuelWalletDevelopmentConnector', () => {
    expect(FuelWalletDevelopmentConnector).toBeDefined();
  });
});
