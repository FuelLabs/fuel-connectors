import { useMemo } from 'react';
import { BRIDGE_URL } from '../../../../config';
import { NoFundIcon } from '../../icons/NoFundIcon';
import {
  ConnectorButton,
  ConnectorButtonPrimary,
  ConnectorContent,
  ConnectorDescription,
  ConnectorImage,
  ConnectorTitle,
} from '../Connector/styles';

type BridgeProps = {
  theme?: string;
  bridgeURL?: string;
  className?: string;
};

export function Bridge({ className, bridgeURL, theme }: BridgeProps) {
  const bridgeHref = useMemo(() => {
    const url = new URL(bridgeURL || BRIDGE_URL);
    url.searchParams.set('from', 'eth');
    url.searchParams.set('to', 'fuel');
    url.searchParams.set('auto_close', 'true');
    return url.toString();
  }, [bridgeURL]);

  return (
    <div className={className}>
      <ConnectorImage>
        <NoFundIcon size={100} theme={theme} />
      </ConnectorImage>
      <ConnectorContent>
        <ConnectorTitle>
          Bridge Funds <br /> to Fuel Ignition
        </ConnectorTitle>
        <ConnectorDescription>
          Looks like you don't have ETH balance, bridge funds to Fuel Ignition
          and use the application without stopping.
        </ConnectorDescription>
      </ConnectorContent>
      <ConnectorButtonPrimary href={bridgeHref} target="_blank">
        Bridge now
      </ConnectorButtonPrimary>
      <ConnectorButton>Continue to application</ConnectorButton>
    </div>
  );
}
