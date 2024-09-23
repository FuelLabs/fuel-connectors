import type { FuelConnector } from 'fuels';
import { useConnectUI } from '../../../../providers/FuelUIProvider';
import {
  ConnectorButton,
  ConnectorButtonPrimary,
  ConnectorDescription,
  ConnectorTitle,
} from '../Connector/styles';
import { DisclaimerContainer, DisclaimerList } from './styles';

type BridgeProps = {
  bridgeURL?: string;
  className?: string;
  connector: FuelConnector;
};

export function ExternalDisclaimer({ className, connector }: BridgeProps) {
  const {
    dialog: { _startConnection, back },
  } = useConnectUI();
  return (
    <div className={className}>
      <DisclaimerContainer>
        <ConnectorTitle style={{ textAlign: 'left' }}>
          Non-Native Wallet
        </ConnectorTitle>
        <ConnectorDescription style={{ textAlign: 'left', margin: 0 }}>
          Fuel supports any wallet from Ethereum to Solana, but these wallets
          have limited functionality for now.
        </ConnectorDescription>
        <DisclaimerList>
          <li>
            Only support blind signature. Make sure you only visit trusted
            applications.
          </li>
          <li>
            You can't see balances inside wallet your Wallet only on FUEL
            applications like the explorer.
          </li>
          <li>
            Does not support multi-sigs (Ex: SAFE) or any Smart Contract wallet.
          </li>
        </DisclaimerList>
      </DisclaimerContainer>
      <ConnectorButtonPrimary onClick={() => _startConnection(connector)}>
        Proceed anyway
      </ConnectorButtonPrimary>
      <ConnectorButton onClick={() => back()}>
        Select a Native Wallet
      </ConnectorButton>
    </div>
  );
}
