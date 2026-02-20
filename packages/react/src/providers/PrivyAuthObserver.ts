import {
  type IPrivyAuthObserver,
  PrivyAuthEventTypes,
} from '@fuel-connectors/common';
import type { ConnectedWallet, User } from '@privy-io/react-auth';
import { EventEmitter } from 'eventemitter3';

/**
 * Implementation of IPrivyAuthObserver using EventEmitter.
 * Generic implementation that accepts concrete Privy types.
 *
 * Type Parameters:
 * - TUser: The user type (e.g., Privy's User)
 * - TEmbeddedWallet: The embedded wallet type (e.g., Privy's ConnectedWallet)
 *
 * This is the concrete implementation used by React, but connectors
 * only know about the IPrivyAuthObserver interface, not this implementation.
 */
export class PrivyAuthObserver<
    TUser extends User = User,
    TEmbeddedWallet extends ConnectedWallet = ConnectedWallet,
  >
  extends EventEmitter<{
    [PrivyAuthEventTypes.authenticated]: [boolean];
    [PrivyAuthEventTypes.ready]: [boolean];
    [PrivyAuthEventTypes.user]: [TUser | undefined];
    [PrivyAuthEventTypes.embeddedWallet]: [TEmbeddedWallet | undefined];
  }>
  implements IPrivyAuthObserver<TUser, TEmbeddedWallet>
{
  private state = {
    authenticated: false,
    ready: false,
    user: undefined as TUser | undefined,
    embeddedWallet: undefined as TEmbeddedWallet | undefined,
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
   */
  setUser(value?: TUser): void {
    if (!this.isEqual(this.state.user, value)) {
      this.state.user = value;
      this.emit(PrivyAuthEventTypes.user, value);
    }
  }

  /**
   * Update embeddedWallet state and emit if changed.
   */
  setEmbeddedWallet(value?: TEmbeddedWallet): void {
    if (!this.isEqual(this.state.embeddedWallet, value)) {
      this.state.embeddedWallet = value;
      this.emit(PrivyAuthEventTypes.embeddedWallet, value);
    }
  }

  /**
   * Get current state snapshot (implements IPrivyAuthObserver).
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Smart comparison to avoid unnecessary emissions.
   */
  private isEqual(prev: unknown, next: unknown): boolean {
    if (prev === next) return true;
    if (!prev || !next) return false;
    if (typeof prev === 'object' && typeof next === 'object') {
      const prevObj = prev as Record<string, unknown>;
      const nextObj = next as Record<string, unknown>;
      return prevObj.id === nextObj.id && prevObj.address === nextObj.address;
    }
    return false;
  }
}
