/**
 * Privy-specific type definitions
 *
 * This file is imported only by components within the lazy-loaded Privy boundary,
 * ensuring that consumers without @privy-io/react-auth installed won't encounter
 * module-not-found errors.
 */

import type { TPrivyAuthObserver } from '@fuel-connectors/common';
import type {
  ConnectedWallet,
  User,
  useLoginWithEmail,
  usePrivy,
  useSignMessage,
} from '@privy-io/react-auth';

/**
 * Concrete implementation of TPrivyAuthObserver with Privy-specific types.
 * Extends the generic observer type with actual Privy function signatures.
 *
 * This type is used throughout the React provider and connectors to ensure
 * type-safe communication via the observer pattern.
 */
export interface PrivyAuthObserverType extends TPrivyAuthObserver {
  User: User;
  EmbeddedWallet: ConnectedWallet;
  SignMessage: ReturnType<typeof useSignMessage>['signMessage'];
  SendCode: ReturnType<typeof useLoginWithEmail>['sendCode'];
  LoginWithCode: ReturnType<typeof useLoginWithEmail>['loginWithCode'];
  Login: ReturnType<typeof usePrivy>['login'];
  Logout: ReturnType<typeof usePrivy>['logout'];
  CreateWallet: ReturnType<typeof usePrivy>['createWallet'];
}
