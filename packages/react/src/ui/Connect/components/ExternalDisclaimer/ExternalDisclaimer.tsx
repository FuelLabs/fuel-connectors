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
            color: 'var(--fuel-color-bold)',
            fontSize: '1.2em',
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
            fontSize: '0.9em',
            textAlign: 'left',
            margin: 0,
            padding: 0,
          }}
        >
          Fuel supports any wallet from Ethereum or Solana, but these wallets
          have limited functionality for now:
        </p>
        <DisclaimerList>
          <li>
            <span
              style={{
                fontSize: '0.9em',
                fontWeight: 600,
                color: 'var(--fuel-gray-12)',
              }}
            >
              Limited Balance Visibility
            </span>
            <br />
            <span
              style={{
                fontSize: '0.8em',
                color: 'var(--fuel-gray-11)',
              }}
            >
              You cannot see balances natively in the wallet (e.g. Metamask).
              You must visit the Fuel Block Explorer to see balances.
            </span>
          </li>
          <li style={{ marginTop: 5, marginBottom: 5 }}>
            <span
              style={{
                fontSize: '0.9em',
                fontWeight: 600,
                color: 'var(--fuel-gray-12)',
              }}
            >
              Signatures are Blind
            </span>
            <br />
            <span style={{ fontSize: '0.8em', color: 'var(--fuel-gray-11)' }}>
              Ensure you only use trusted applications.
            </span>
          </li>
          <li>
            <span
              style={{
                fontSize: '0.9em',
                fontWeight: 600,
                color: 'var(--fuel-gray-12)',
              }}
            >
              No Multi-Sigs
            </span>
            <br />
            <span style={{ fontSize: '0.8em', color: 'var(--fuel-gray-11)' }}>
              Multi-sigs and smart contract wallets (e.g. SAFE) are not
              supported.
            </span>
          </li>
        </DisclaimerList>
      </DisclaimerContainer>
      <ConnectorButtonPrimary onClick={() => _startConnection(connector)}>
        Proceed
      </ConnectorButtonPrimary>
      <ConnectorButton onClick={() => back()}>
        Select a Native Wallet
      </ConnectorButton>
    </div>
  );
}
