import { describe, expect, test } from 'vitest';

import { BakoSafeConnector } from '../src/index';

describe('index', () => {
  test('should export BakoSafeConnector', () => {
    expect(BakoSafeConnector).toBeDefined();
  });
});
