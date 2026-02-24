import { PrivyAuthEventTypes } from '@fuel-connectors/common';
import type { IPrivyAuthObserver } from '@fuel-connectors/common';
import type { ConnectedWallet, User } from '@privy-io/react-auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SocialConnector } from '../SocialConnector';
import type { PrivyAuthInterface, PrivyAuthObserverType } from '../types';

interface MockPrivyAuthObserver
  extends IPrivyAuthObserver<PrivyAuthObserverType> {
  emit(event: PrivyAuthEventTypes, value?: unknown): void;
}

type AuthenticatedListener = (value: boolean) => void;
type ReadyListener = (value: boolean) => void;
type UserListener = (value?: User) => void;
type WalletListener = (value?: ConnectedWallet) => void;

// Helper to create a mock User object for testing
const createMockUser = (address: string): User =>
  ({
    wallet: { address },
  }) as unknown as User;

// Helper to create a mock ConnectedWallet object for testing
const createMockWallet = (address: string): ConnectedWallet =>
  ({
    address,
    walletClientType: 'privy',
    getEthereumProvider: vi.fn(),
  }) as unknown as ConnectedWallet;

// Mock Privy auth interface
const createMockPrivyAuth = (
  overrides: Partial<PrivyAuthInterface> = {},
): PrivyAuthInterface => ({
  authenticated: false,
  ready: true,
  user: undefined,
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  signMessage: vi.fn().mockResolvedValue({ signature: '0xmocksignature' }),
  ...overrides,
});

// Mock Observer implementation for testing
const createMockObserver = (): MockPrivyAuthObserver => {
  const authenticatedListeners: Set<AuthenticatedListener> = new Set();
  const readyListeners: Set<ReadyListener> = new Set();
  const userListeners: Set<UserListener> = new Set();
  const walletListeners: Set<WalletListener> = new Set();

  const state: Pick<
    PrivyAuthInterface,
    'authenticated' | 'ready' | 'user' | 'embeddedWallet'
  > = {
    authenticated: false,
    ready: true,
    user: undefined,
    embeddedWallet: undefined,
  };

  const observer = {
    on(
      event: PrivyAuthEventTypes,
      listener:
        | ((value: boolean) => void)
        | ((value?: User) => void)
        | ((value?: ConnectedWallet) => void)
        | ((value?: unknown) => void),
    ): void {
      switch (event) {
        case PrivyAuthEventTypes.authenticated:
          authenticatedListeners.add(listener as AuthenticatedListener);
          break;
        case PrivyAuthEventTypes.ready:
          readyListeners.add(listener as ReadyListener);
          break;
        case PrivyAuthEventTypes.user:
          userListeners.add(listener as UserListener);
          break;
        case PrivyAuthEventTypes.embeddedWallet:
          walletListeners.add(listener as WalletListener);
          break;
      }
    },
    off(
      event: PrivyAuthEventTypes,
      listener:
        | ((value: boolean) => void)
        | ((value?: User) => void)
        | ((value?: ConnectedWallet) => void)
        | ((value?: unknown) => void),
    ): void {
      switch (event) {
        case PrivyAuthEventTypes.authenticated:
          authenticatedListeners.delete(listener as AuthenticatedListener);
          break;
        case PrivyAuthEventTypes.ready:
          readyListeners.delete(listener as ReadyListener);
          break;
        case PrivyAuthEventTypes.user:
          userListeners.delete(listener as UserListener);
          break;
        case PrivyAuthEventTypes.embeddedWallet:
          walletListeners.delete(listener as WalletListener);
          break;
      }
    },
    emit(
      event: PrivyAuthEventTypes,
      value?: boolean | User | ConnectedWallet | unknown,
    ): void {
      // Update internal state on emit
      switch (event) {
        case PrivyAuthEventTypes.authenticated:
          state.authenticated = value as boolean;
          authenticatedListeners.forEach((listener) =>
            listener(value as boolean),
          );
          break;
        case PrivyAuthEventTypes.ready:
          state.ready = value as boolean;
          readyListeners.forEach((listener) => listener(value as boolean));
          break;
        case PrivyAuthEventTypes.user:
          state.user = value as User | undefined;
          userListeners.forEach((listener) => listener(value as User));
          break;
        case PrivyAuthEventTypes.embeddedWallet:
          state.embeddedWallet = value as ConnectedWallet | undefined;
          walletListeners.forEach((listener) =>
            listener(value as ConnectedWallet),
          );
          break;
      }
    },
    getState() {
      return {
        authenticated: state.authenticated,
        ready: state.ready,
        user: state.user,
        embeddedWallet: state.embeddedWallet,
        signMessage: undefined,
        sendCode: undefined,
        loginWithCode: undefined,
        login: undefined,
        logout: undefined,
        createWallet: undefined,
      };
    },
  } as MockPrivyAuthObserver;

  return observer;
};

describe('Social Connector', () => {
  describe('constructor()', () => {
    it('should create a new SocialConnector instance', () => {
      const connector = new SocialConnector();
      expect(connector).toBeDefined();
      expect(connector.name).toBe('Social Login');
      expect(connector.installed).toBe(true);
    });

    it('should accept privyAuth via setPrivyAuth()', () => {
      const mockPrivy = createMockPrivyAuth({ authenticated: true });
      const connector = new SocialConnector();
      connector.setPrivyAuth(mockPrivy);
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
        user: createMockUser(mockAddress),
      });
      const connector = new SocialConnector();
      connector.setPrivyAuth(mockPrivy);
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
        user: createMockUser('0x123'),
      });
      const connector = new SocialConnector();
      connector.setPrivyAuth(mockPrivy);
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
        mockPrivy.user = createMockUser('0x123');
      });

      const connector = new SocialConnector();
      connector.setPrivyAuth(mockPrivy);
      const result = await connector._connect();

      expect(mockPrivy.login).toHaveBeenCalledWith({
        loginMethods: ['email'],
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

    it(
      'should call logout and return true if was authenticated',
      async () => {
        const mockPrivy = createMockPrivyAuth({ authenticated: true });
        const connector = new SocialConnector();
        connector.setPrivyAuth(mockPrivy);
        const result = await connector._disconnect();
        expect(mockPrivy.logout).toHaveBeenCalled();
        expect(result).toBe(true);
      },
      { timeout: 10000 },
    );
  });

  describe('signMessageCustomCurve()', () => {
    it('should sign message and return secp256k1 curve', async () => {
      const mockSignature = '0xsignature123';
      const mockPrivy = createMockPrivyAuth({
        authenticated: true,
        signMessage: vi.fn().mockResolvedValue({ signature: mockSignature }),
      });
      const connector = new SocialConnector();
      connector.setPrivyAuth(mockPrivy);

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

  describe('Observer Pattern - setPrivyAuthObserver()', () => {
    let observer: MockPrivyAuthObserver;

    beforeEach(() => {
      observer = createMockObserver();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    describe('Observer setup and registration', () => {
      it('should register observer and setup listeners', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth();
        connector.setPrivyAuth(mockPrivy);

        const onSpy = vi.spyOn(observer, 'on');
        connector.setPrivyAuthObserver(observer);

        // Verify all 10 event listeners are registered
        expect(onSpy).toHaveBeenCalledWith(
          PrivyAuthEventTypes.authenticated,
          expect.any(Function),
        );
        expect(onSpy).toHaveBeenCalledWith(
          PrivyAuthEventTypes.ready,
          expect.any(Function),
        );
        expect(onSpy).toHaveBeenCalledWith(
          PrivyAuthEventTypes.user,
          expect.any(Function),
        );
        expect(onSpy).toHaveBeenCalledWith(
          PrivyAuthEventTypes.embeddedWallet,
          expect.any(Function),
        );
        expect(onSpy).toHaveBeenCalledWith(
          PrivyAuthEventTypes.signMessage,
          expect.any(Function),
        );
        expect(onSpy).toHaveBeenCalledWith(
          PrivyAuthEventTypes.sendCode,
          expect.any(Function),
        );
        expect(onSpy).toHaveBeenCalledWith(
          PrivyAuthEventTypes.loginWithCode,
          expect.any(Function),
        );
        expect(onSpy).toHaveBeenCalledWith(
          PrivyAuthEventTypes.login,
          expect.any(Function),
        );
        expect(onSpy).toHaveBeenCalledWith(
          PrivyAuthEventTypes.logout,
          expect.any(Function),
        );
        expect(onSpy).toHaveBeenCalledWith(
          PrivyAuthEventTypes.createWallet,
          expect.any(Function),
        );
      });

      it('should handle observer being null', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth();
        connector.setPrivyAuth(mockPrivy);

        // Should not throw when observer is null
        expect(() => connector.setPrivyAuthObserver(null)).not.toThrow();
      });
    });

    describe('getState() - Observer state snapshot', () => {
      it('should return initial state', () => {
        const state = observer.getState();
        expect(state).toEqual({
          authenticated: false,
          ready: true,
          user: undefined,
          embeddedWallet: undefined,
        });
      });

      it('should return updated state after authenticated event', () => {
        observer.emit(PrivyAuthEventTypes.authenticated, true);
        const state = observer.getState();
        expect(state.authenticated).toBe(true);
      });

      it('should return updated state after ready event', () => {
        observer.emit(PrivyAuthEventTypes.ready, false);
        const state = observer.getState();
        expect(state.ready).toBe(false);
      });

      it('should return updated state after user event', () => {
        const user = createMockUser('0xuser123');
        observer.emit(PrivyAuthEventTypes.user, user);
        const state = observer.getState();
        expect(state.user).toEqual(user);
      });

      it('should return updated state after embeddedWallet event', () => {
        const wallet = createMockWallet('0xwallet123');
        observer.emit(PrivyAuthEventTypes.embeddedWallet, wallet);
        const state = observer.getState();
        expect(state.embeddedWallet).toEqual(wallet);
      });

      it('should return accumulated state after multiple events', () => {
        observer.emit(PrivyAuthEventTypes.authenticated, true);
        observer.emit(PrivyAuthEventTypes.ready, false);
        const user = createMockUser('0xuser123');
        observer.emit(PrivyAuthEventTypes.user, user);

        const state = observer.getState();
        expect(state).toEqual({
          authenticated: true,
          ready: false,
          user,
          embeddedWallet: undefined,
        });
      });

      it('should reflect state changes from successive events', () => {
        // First state
        observer.emit(PrivyAuthEventTypes.authenticated, false);
        let state = observer.getState();
        expect(state.authenticated).toBe(false);

        // Update state
        observer.emit(PrivyAuthEventTypes.authenticated, true);
        state = observer.getState();
        expect(state.authenticated).toBe(true);

        // Change back
        observer.emit(PrivyAuthEventTypes.authenticated, false);
        state = observer.getState();
        expect(state.authenticated).toBe(false);
      });

      it('should handle null values in state', () => {
        const user = createMockUser('0xuser123');
        observer.emit(PrivyAuthEventTypes.user, user);
        let state = observer.getState();
        expect(state.user).toEqual(user);

        // Set to undefined
        observer.emit(PrivyAuthEventTypes.user, undefined);
        state = observer.getState();
        expect(state.user).toBeUndefined();
      });

      it('should return independent state snapshot (not reference)', () => {
        const user = createMockUser('0xuser123');
        observer.emit(PrivyAuthEventTypes.user, user);

        const state1 = observer.getState();
        const state2 = observer.getState();

        // Both should have same values
        expect(state1).toEqual(state2);

        // But should be independent calls
        expect(state1).not.toBe(state2);
      });
    });

    describe('authenticated event listener', () => {
      it('should update privyAuth.authenticated when observer emits authenticated event', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({ authenticated: false });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        observer.emit(PrivyAuthEventTypes.authenticated, true);

        expect(mockPrivy.authenticated).toBe(true);
      });

      it('should trigger auto-reconnect when authenticated becomes true while ready', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({
          authenticated: false,
          ready: true,
        });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        // Mock localStorage
        const mockAccount = '0x1234567890abcdef';
        vi.stubGlobal('localStorage', {
          getItem: vi.fn().mockReturnValue(mockAccount),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0,
          key: vi.fn(),
        });

        observer.emit(PrivyAuthEventTypes.authenticated, true);

        expect(mockPrivy.authenticated).toBe(true);

        vi.unstubAllGlobals();
      });

      it('should not trigger auto-reconnect if not ready', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({
          authenticated: false,
          ready: false,
        });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        observer.emit(PrivyAuthEventTypes.authenticated, true);

        expect(mockPrivy.authenticated).toBe(true);
        // Auto-reconnect should not have been triggered (would need ready=true)
      });
    });

    describe('ready event listener', () => {
      it('should update privyAuth.ready when observer emits ready event', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({ ready: false });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        observer.emit(PrivyAuthEventTypes.ready, true);

        expect(mockPrivy.ready).toBe(true);
      });

      it('should trigger auto-reconnect when ready becomes true while authenticated', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({
          authenticated: true,
          ready: false,
        });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        const mockAccount = '0x1234567890abcdef';
        vi.stubGlobal('localStorage', {
          getItem: vi.fn().mockReturnValue(mockAccount),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0,
          key: vi.fn(),
        });

        observer.emit(PrivyAuthEventTypes.ready, true);

        expect(mockPrivy.ready).toBe(true);

        vi.unstubAllGlobals();
      });
    });

    describe('user event listener', () => {
      it('should update privyAuth.user when observer emits user event', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({ user: undefined });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        const newUser = createMockUser('0xuser123');
        observer.emit(PrivyAuthEventTypes.user, newUser);

        expect(mockPrivy.user).toEqual(newUser);
      });

      it('should handle user reset to undefined', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({
          user: createMockUser('0x123'),
        });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        observer.emit(PrivyAuthEventTypes.user, undefined);

        expect(mockPrivy.user).toBeUndefined();
      });

      it('should handle user without wallet', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({ user: undefined });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        const userWithoutWallet: User = { id: 'user123' } as User;
        observer.emit(PrivyAuthEventTypes.user, userWithoutWallet);

        expect(mockPrivy.user).toEqual(userWithoutWallet);
      });
    });

    describe('embeddedWallet event listener', () => {
      it('should update privyAuth.embeddedWallet when observer emits event', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({ embeddedWallet: undefined });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        const wallet = createMockWallet('0xwallet123');
        observer.emit(PrivyAuthEventTypes.embeddedWallet, wallet);

        expect(mockPrivy.embeddedWallet).toEqual(wallet);
      });

      it('should handle undefined embeddedWallet', () => {
        const connector = new SocialConnector();
        const wallet = createMockWallet('0xwallet123');
        const mockPrivy = createMockPrivyAuth({ embeddedWallet: wallet });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        observer.emit(PrivyAuthEventTypes.embeddedWallet, undefined);

        expect(mockPrivy.embeddedWallet).toBeUndefined();
      });
    });

    describe('observer cleanup and memory management', () => {
      it(
        'should remove all listeners on disconnect',
        async () => {
          const connector = new SocialConnector();
          const mockPrivy = createMockPrivyAuth({ authenticated: true });
          connector.setPrivyAuth(mockPrivy);
          connector.setPrivyAuthObserver(observer);

          const offSpy = vi.spyOn(observer, 'off');

          await connector._disconnect();

          expect(offSpy).toHaveBeenCalledTimes(10);
          // Verify all event listeners are removed
          expect(offSpy).toHaveBeenCalledWith(
            PrivyAuthEventTypes.authenticated,
            expect.any(Function),
          );
          expect(offSpy).toHaveBeenCalledWith(
            PrivyAuthEventTypes.ready,
            expect.any(Function),
          );
          expect(offSpy).toHaveBeenCalledWith(
            PrivyAuthEventTypes.user,
            expect.any(Function),
          );
          expect(offSpy).toHaveBeenCalledWith(
            PrivyAuthEventTypes.embeddedWallet,
            expect.any(Function),
          );
          expect(offSpy).toHaveBeenCalledWith(
            PrivyAuthEventTypes.signMessage,
            expect.any(Function),
          );
          expect(offSpy).toHaveBeenCalledWith(
            PrivyAuthEventTypes.sendCode,
            expect.any(Function),
          );
          expect(offSpy).toHaveBeenCalledWith(
            PrivyAuthEventTypes.loginWithCode,
            expect.any(Function),
          );
          expect(offSpy).toHaveBeenCalledWith(
            PrivyAuthEventTypes.login,
            expect.any(Function),
          );
          expect(offSpy).toHaveBeenCalledWith(
            PrivyAuthEventTypes.logout,
            expect.any(Function),
          );
          expect(offSpy).toHaveBeenCalledWith(
            PrivyAuthEventTypes.createWallet,
            expect.any(Function),
          );
        },
        { timeout: 10000 },
      );

      it('should not throw when removing listeners if observer is null', async () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({ authenticated: true });
        connector.setPrivyAuth(mockPrivy);

        // Set observer then clear it internally
        expect(() => connector._disconnect()).not.toThrow();
      });

      it('should properly deregister listener so it is not called after removal', async () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({
          authenticated: false,
          ready: true,
        });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        // Emit event to verify listener works
        observer.emit(PrivyAuthEventTypes.authenticated, true);
        expect(mockPrivy.authenticated).toBe(true);

        // Reset
        mockPrivy.authenticated = false;

        // Disconnect to remove listeners
        await connector._disconnect();

        // Emit again - listener should not be called
        observer.emit(PrivyAuthEventTypes.authenticated, true);

        // Value should not have changed (listener was removed)
        expect(mockPrivy.authenticated).toBe(false);
      });
    });

    describe('multiple sequential observer registrations', () => {
      it('should handle replacing observer with a new one', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth();
        connector.setPrivyAuth(mockPrivy);

        const observer1 = createMockObserver();
        const observer2 = createMockObserver();

        const onSpy1 = vi.spyOn(observer1, 'on');
        const onSpy2 = vi.spyOn(observer2, 'on');

        connector.setPrivyAuthObserver(observer1);
        expect(onSpy1).toHaveBeenCalledTimes(10);

        connector.setPrivyAuthObserver(observer2);
        expect(onSpy2).toHaveBeenCalledTimes(10);
      });
    });

    describe('observer event race conditions', () => {
      it('should handle rapid consecutive authenticated and ready events', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({
          authenticated: false,
          ready: false,
        });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        // Simulate rapid state changes
        observer.emit(PrivyAuthEventTypes.authenticated, true);
        observer.emit(PrivyAuthEventTypes.ready, true);

        expect(mockPrivy.authenticated).toBe(true);
        expect(mockPrivy.ready).toBe(true);
      });

      it('should handle user and embeddedWallet events in sequence', () => {
        const connector = new SocialConnector();
        const mockPrivy = createMockPrivyAuth({ user: undefined });
        connector.setPrivyAuth(mockPrivy);
        connector.setPrivyAuthObserver(observer);

        const user = createMockUser('0xuser123');
        const wallet = createMockWallet('0xwallet456');

        observer.emit(PrivyAuthEventTypes.user, user);
        observer.emit(PrivyAuthEventTypes.embeddedWallet, wallet);

        expect(mockPrivy.user).toEqual(user);
        expect(mockPrivy.embeddedWallet).toEqual(wallet);
      });
    });
  });
});
