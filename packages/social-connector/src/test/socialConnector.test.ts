import { describe, expect, it, vi } from 'vitest';
import { SocialConnector } from '../SocialConnector';
import type { PrivyAuthInterface } from '../types';

// Mock Privy auth interface
const createMockPrivyAuth = (
  overrides: Partial<PrivyAuthInterface> = {},
): PrivyAuthInterface => ({
  authenticated: false,
  ready: true,
  user: null,
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  signMessage: vi.fn().mockResolvedValue({ signature: '0xmocksignature' }),
  ...overrides,
});

describe('Social Connector', () => {
  describe('constructor()', () => {
    it('should create a new SocialConnector instance', () => {
      const connector = new SocialConnector();
      expect(connector).toBeDefined();
      expect(connector.name).toBe('Social Login');
      expect(connector.installed).toBe(true);
    });

    it('should accept privyAuth config', () => {
      const mockPrivy = createMockPrivyAuth({ authenticated: true });
      const connector = new SocialConnector({ privyAuth: mockPrivy });
      expect(connector).toBeDefined();
    });
  });

  describe('setPrivyAuth()', () => {
    it('should update the privy auth interface', () => {
      const connector = new SocialConnector();
      const mockPrivy = createMockPrivyAuth({ authenticated: true });
      connector.setPrivyAuth(mockPrivy);
      expect(connector).toBeDefined();
    });
  });

  describe('_getCurrentEvmAddress()', () => {
    it('should return null when privy is not configured', () => {
      const connector = new SocialConnector();
      // @ts-expect-error - accessing protected method for testing
      const address = connector._getCurrentEvmAddress();
      expect(address).toBeNull();
    });

    it('should return address when user is authenticated', () => {
      const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
      const mockPrivy = createMockPrivyAuth({
        authenticated: true,
        user: { wallet: { address: mockAddress } },
      });
      const connector = new SocialConnector({ privyAuth: mockPrivy });
      // @ts-expect-error - accessing protected method for testing
      const address = connector._getCurrentEvmAddress();
      expect(address).toBe(mockAddress);
    });
  });

  describe('_connect()', () => {
    it('should throw error when privy is not configured', async () => {
      const connector = new SocialConnector();
      await expect(connector._connect()).rejects.toThrow(
        'Privy auth not configured',
      );
    });

    it('should return true if already authenticated', async () => {
      const mockPrivy = createMockPrivyAuth({
        authenticated: true,
        user: { wallet: { address: '0x123' } },
      });
      const connector = new SocialConnector({ privyAuth: mockPrivy });
      const result = await connector._connect();
      expect(result).toBe(true);
      expect(mockPrivy.login).not.toHaveBeenCalled();
    });

    it('should call login when not authenticated', async () => {
      const mockPrivy = createMockPrivyAuth({
        authenticated: false,
        ready: true,
      });
      // Mock login to update authenticated state
      mockPrivy.login = vi.fn().mockImplementation(async () => {
        mockPrivy.authenticated = true;
        mockPrivy.user = { wallet: { address: '0x123' } };
      });

      const connector = new SocialConnector({ privyAuth: mockPrivy });
      const result = await connector._connect();

      expect(mockPrivy.login).toHaveBeenCalledWith({
        loginMethods: ['google', 'email'],
      });
      expect(result).toBe(true);
    });
  });

  describe('_disconnect()', () => {
    it('should return false when privy is not configured', async () => {
      const connector = new SocialConnector();
      const result = await connector._disconnect();
      expect(result).toBe(false);
    });

    it('should call logout and return true if was authenticated', async () => {
      const mockPrivy = createMockPrivyAuth({ authenticated: true });
      const connector = new SocialConnector({ privyAuth: mockPrivy });
      const result = await connector._disconnect();
      expect(mockPrivy.logout).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('signMessageCustomCurve()', () => {
    it('should sign message and return secp256k1 curve', async () => {
      const mockSignature = '0xsignature123';
      const mockPrivy = createMockPrivyAuth({
        authenticated: true,
        signMessage: vi.fn().mockResolvedValue({ signature: mockSignature }),
      });
      const connector = new SocialConnector({ privyAuth: mockPrivy });

      const result = await connector.signMessageCustomCurve('test message');

      expect(result.curve).toBe('secp256k1');
      expect(result.signature).toBe(mockSignature);
    });
  });

  describe('metadata', () => {
    it('should have correct metadata', () => {
      const connector = new SocialConnector();
      expect(connector.metadata.image).toBeDefined();
      expect(connector.metadata.install?.action).toBe('Connect');
      expect(connector.metadata.install?.description).toContain('Google');
      expect(connector.metadata.install?.link).toContain('privy.io');
    });
  });
});
