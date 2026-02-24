import type { TPrivyAuthObserver } from '@fuel-connectors/common';
import type {
  ConnectedWallet,
  PrivyClientConfig,
  User,
  useLoginWithEmail,
  usePrivy,
  useSignMessage,
} from '@privy-io/react-auth';
import type { Network } from 'fuels';

export type Connector = {
  name: string;
  image:
    | string
    | {
        light: string;
        dark: string;
      };
  connector: string;
  install: {
    action: string;
    link: string;
    description: string;
  };
  installed: boolean;
};

export interface NetworkConfig extends Partial<Network> {
  bridgeURL?: string;
}

export type UIConfig = {
  suggestBridge?: boolean;
};

export type SvgIconProps = {
  theme?: string;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  size: number;
};

export type ConnectorList = Array<Connector>;

/** Configuration for Social Login via Privy */
export type PrivyConfig = {
  appId: string;
  config: PrivyClientConfig;
};

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
