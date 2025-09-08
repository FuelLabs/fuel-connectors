import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useMemo, useState } from 'react';
import {
  useAccount,
  useBalance,
  useIsSupportedNetwork,
  useProvider,
} from '../../../../hooks';
import { NoFundIcon } from '../../../../icons/NoFundIcon';
import { useConnectUI } from '../../../../providers/FuelUIProvider';
import { useNetworkConfigs } from '../../hooks/useNetworkConfigs';
import {
  BackIcon,
  CloseIcon,
  DialogHeader,
  DialogMain,
  DialogTitle,
  Divider,
} from '../../styles';
import {
  ConnectorButton,
  ConnectorButtonPrimary,
  ConnectorContent,
  ConnectorDescription,
  ConnectorImage,
  ConnectorTitle,
} from '../Connector/styles';
import { DialogContent } from '../Core/DialogContent';
import { DialogFuel } from '../Core/DialogFuel';

type BridgeProps = {
  theme: 'dark' | 'light';
};

export function BridgeDialog({ theme }: BridgeProps) {
  const { networks } = useNetworkConfigs();
  const { provider } = useProvider();
  const [bridgeHref, setBridgeHref] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;
    const fetchBridgeHref = async () => {
      if (abort) return;
      const chainId = await provider?.getChainId();
      const network = networks.find((n) => n.chainId === chainId);
      if (abort) return;
      if (network?.bridgeURL) {
        const url = new URL(network.bridgeURL);
        url.searchParams.set('', 'true');
        setBridgeHref(url.toString());
      } else {
        setBridgeHref(null);
      }
    };
    fetchBridgeHref();
    return () => {
      abort = true;
    };
  }, [networks, provider]);
  const {
    isConnected,
    uiConfig,
    dialog: { isOpen: isConnectOpen },
  } = useConnectUI();
  const { isSupportedNetwork } = useIsSupportedNetwork();
  const { account } = useAccount();
  const { balance } = useBalance({ account });
  const [tempClose, setTempClose] = useState(false);

  const shouldOpenBridge = useMemo(() => {
    if (tempClose) return false;
    if (isConnectOpen) return false;
    if (!bridgeHref) return false;
    if (!uiConfig.suggestBridge) return false;
    if (!isConnected) return false;
    if (!isSupportedNetwork) return false;
    return !!balance?.isZero();
  }, [
    uiConfig,
    balance,
    isSupportedNetwork,
    isConnected,
    tempClose,
    bridgeHref,
    isConnectOpen,
  ]);

  return (
    <DialogFuel
      open={shouldOpenBridge}
      theme={theme}
      onOpenChange={(state) => {
        if (!state) {
          setTempClose(true);
        }
      }}
    >
      <DialogContent data-connector={true}>
        <DialogHeader>
          <BackIcon size={32} data-connector={false} />
          <DialogTitle>Bridge Funds</DialogTitle>
          <Dialog.Close asChild>
            <CloseIcon size={32} />
          </Dialog.Close>
        </DialogHeader>
        <Divider />
        <DialogMain>
          <div>
            <ConnectorImage>
              <NoFundIcon size={100} theme={theme} />
            </ConnectorImage>
            <ConnectorContent>
              <ConnectorTitle>
                Bridge Funds <br /> to Fuel Ignition
              </ConnectorTitle>
              <ConnectorDescription>
                Looks like you don't have ETH balance, bridge funds to Fuel
                Ignition and use the application without stopping.
              </ConnectorDescription>
            </ConnectorContent>
            <ConnectorButtonPrimary href={bridgeHref ?? ''} target="_blank">
              Bridge now
            </ConnectorButtonPrimary>
            <ConnectorButton onClick={() => setTempClose(true)}>
              Continue to application
            </ConnectorButton>
          </div>
        </DialogMain>
      </DialogContent>
    </DialogFuel>
  );
}
