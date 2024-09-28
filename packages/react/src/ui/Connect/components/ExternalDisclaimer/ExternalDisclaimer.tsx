import { useConnectUI } from '../../../../providers/FuelUIProvider';
import {
  ConnectorButton,
  ConnectorButtonPrimary,
  connectorDescriptionStyle,
  connectorTitleStyle,
} from '../Connector/styles';
import { DisclaimerContainer, DisclaimerList } from './styles';

export function ExternalDisclaimer() {
  const {
    dialog: { connector, _startConnection, back },
  } = useConnectUI();

  if (!connector) return null;

  return (
    <div>
      <DisclaimerContainer>
        <h2
          style={{
            ...connectorTitleStyle,
            textAlign: 'left',
            margin: 0,
            padding: 0,
          }}
        >
          Non-Native Wallet
        </h2>
        <p
          style={{
            ...connectorDescriptionStyle,
            textAlign: 'left',
            margin: 0,
            padding: 0,
          }}
        >
          Fuel supports any wallet from Ethereum to Solana, but these wallets
          have limited functionality for now.
        </p>
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
