import type {
  PrivyClientConfig,
  SignMessageModalUIOptions,
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

export type PrivySignMessage = (
  input: {
    message: string;
  },
  options?: {
    uiOptions?: SignMessageModalUIOptions;
    address?: string;
  },
) => Promise<{
  signature: string;
}>;

/** Configuration for Social Login via Privy */
export type PrivyConfig = {
  appId: string;
  config: PrivyClientConfig;
};
