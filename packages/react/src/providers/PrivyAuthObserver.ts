import {
  type IPrivyAuthObserver,
  PrivyAuthEventTypes,
  type TPrivyAuthObserver,
} from '@fuel-connectors/common';
import { EventEmitter } from 'eventemitter3';

/**
 * Implementation of IPrivyAuthObserver using EventEmitter.
 * Generic implementation that accepts concrete Privy types.
 *
 * Type Parameters:
 * - T: Object type conforming to TPrivyAuthObserver, containing properties:
 *   - User: The user type (e.g., Privy's User)
 *   - EmbeddedWallet: The embedded wallet type (e.g., Privy's ConnectedWallet)
 *   - SignMessage: The signMessage function type
 *   - SendCode: The sendCode function type
 *   - LoginWithCode: The loginWithCode function type
 *   - Login: The login function type
 *   - Logout: The logout function type
 *   - CreateWallet: The createWallet function type
 *
 * This is the concrete implementation used by React, but connectors
 * only know about the IPrivyAuthObserver interface, not this implementation.
 */
export class PrivyAuthObserver<
    T extends TPrivyAuthObserver = TPrivyAuthObserver,
  >
  extends EventEmitter<{
    [PrivyAuthEventTypes.authenticated]: [boolean];
    [PrivyAuthEventTypes.ready]: [boolean];
    [PrivyAuthEventTypes.user]: [T['User'] | undefined];
    [PrivyAuthEventTypes.embeddedWallet]: [T['EmbeddedWallet'] | undefined];
    [PrivyAuthEventTypes.signMessage]: [T['SignMessage'] | undefined];
    [PrivyAuthEventTypes.sendCode]: [T['SendCode'] | undefined];
    [PrivyAuthEventTypes.loginWithCode]: [T['LoginWithCode'] | undefined];
    [PrivyAuthEventTypes.login]: [T['Login'] | undefined];
    [PrivyAuthEventTypes.logout]: [T['Logout'] | undefined];
    [PrivyAuthEventTypes.createWallet]: [T['CreateWallet'] | undefined];
  }>
  implements IPrivyAuthObserver<T>
{
  private state = {
    authenticated: false,
    ready: false,
    user: undefined as T['User'] | undefined,
    embeddedWallet: undefined as T['EmbeddedWallet'] | undefined,
    signMessage: undefined as T['SignMessage'] | undefined,
    sendCode: undefined as T['SendCode'] | undefined,
    loginWithCode: undefined as T['LoginWithCode'] | undefined,
    login: undefined as T['Login'] | undefined,
    logout: undefined as T['Logout'] | undefined,
    createWallet: undefined as T['CreateWallet'] | undefined,
  };

  /**
   * Update authenticated state and emit if changed.
   */
  setAuthenticated(value: boolean): void {
    if (this.state.authenticated !== value) {
      this.state.authenticated = value;
      this.emit(PrivyAuthEventTypes.authenticated, value);
    }
  }

  /**
   * Update ready state and emit if changed.
   */
  setReady(value: boolean): void {
    if (this.state.ready !== value) {
      this.state.ready = value;
      this.emit(PrivyAuthEventTypes.ready, value);
    }
  }

  /**
   * Update user state and emit if changed.
   * Compares by id to detect user changes.
   */
  setUser(value?: T['User']): void {
    if (!this.isUserEqual(this.state.user, value)) {
      this.state.user = value;
      this.emit(PrivyAuthEventTypes.user, value);
    }
  }

  /**
   * Update embeddedWallet state and emit if changed.
   * Compares by address to detect wallet changes.
   */
  setEmbeddedWallet(value?: T['EmbeddedWallet']): void {
    if (!this.isEmbeddedWalletEqual(this.state.embeddedWallet, value)) {
      this.state.embeddedWallet = value;
      this.emit(PrivyAuthEventTypes.embeddedWallet, value);
    }
  }

  /**
   * Update signMessage function and emit if changed.
   */
  setSignMessage(value?: T['SignMessage']): void {
    if (this.state.signMessage !== value) {
      this.state.signMessage = value;
      this.emit(PrivyAuthEventTypes.signMessage, value);
    }
  }

  /**
   * Update sendCode function and emit if changed.
   */
  setSendCode(value?: T['SendCode']): void {
    if (this.state.sendCode !== value) {
      this.state.sendCode = value;
      this.emit(PrivyAuthEventTypes.sendCode, value);
    }
  }

  /**
   * Update loginWithCode function and emit if changed.
   */
  setLoginWithCode(value?: T['LoginWithCode']): void {
    if (this.state.loginWithCode !== value) {
      this.state.loginWithCode = value;
      this.emit(PrivyAuthEventTypes.loginWithCode, value);
    }
  }

  /**
   * Update login function and emit if changed.
   */
  setLogin(value?: T['Login']): void {
    if (this.state.login !== value) {
      this.state.login = value;
      this.emit(PrivyAuthEventTypes.login, value);
    }
  }

  /**
   * Update logout function and emit if changed.
   */
  setLogout(value?: T['Logout']): void {
    if (this.state.logout !== value) {
      this.state.logout = value;
      this.emit(PrivyAuthEventTypes.logout, value);
    }
  }

  /**
   * Update createWallet function and emit if changed.
   */
  setCreateWallet(value?: T['CreateWallet']): void {
    if (this.state.createWallet !== value) {
      this.state.createWallet = value;
      this.emit(PrivyAuthEventTypes.createWallet, value);
    }
  }

  /**
   * Get current state snapshot (implements IPrivyAuthObserver).
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Clean up resources when observer is no longer needed.
   * Removes all listeners and resets state.
   */
  destroy(): void {
    this.removeAllListeners();
    this.state = {
      authenticated: false,
      ready: false,
      user: undefined,
      embeddedWallet: undefined,
      signMessage: undefined,
      sendCode: undefined,
      loginWithCode: undefined,
      login: undefined,
      logout: undefined,
      createWallet: undefined,
    };
  }

  /**
   * Smart comparison for User objects - compare by id.
   */
  private isUserEqual(prev?: T['User'], next?: T['User']): boolean {
    if (prev === next) return true;
    if (!prev || !next) return false;
    return (
      (prev as Record<string, unknown>).id ===
      (next as Record<string, unknown>).id
    );
  }

  /**
   * Smart comparison for EmbeddedWallet objects - compare by address.
   */
  private isEmbeddedWalletEqual(
    prev?: T['EmbeddedWallet'],
    next?: T['EmbeddedWallet'],
  ): boolean {
    if (prev === next) return true;
    if (!prev || !next) return false;
    return (
      (prev as Record<string, unknown>).address ===
      (next as Record<string, unknown>).address
    );
  }
}
