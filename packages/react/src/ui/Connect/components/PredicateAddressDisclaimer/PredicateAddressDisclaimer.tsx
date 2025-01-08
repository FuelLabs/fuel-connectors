import { useConnectUI } from '../../../../providers/FuelUIProvider';
import { ConnectorButtonPrimary, ConnectorContent } from '../Connector/styles';

export function PredicateAddressDisclaimer() {
  const { cancel } = useConnectUI();

  return (
    <div>
      <ConnectorContent>
        <div
          style={{
            color: 'var(--fuel-blue-a11)',
            backgroundColor: 'var(--fuel-blue-a3)',
            fontSize: 'var(--fuel-font-size-xs)',
            margin: '0 1.2em',
            border: '1px solid var(--fuel-blue-6)',
            borderRadius: 'var(--fuel-border-radius)',
            padding: 12,
          }}
        >
          <b>Please Note:</b> EVM/SVM addresses will differ from your{' '}
          <b>Fuel predicate address</b>. This is expected behavior.
          <br />
          <br />
          For more details,{' '}
          <a
            href="https://github.com/FuelLabs/fuel-connectors/wiki"
            target="_blank"
            rel="noreferrer"
            className="fuel-connectors-link-underline"
            style={{
              fontWeight: 600,
            }}
          >
            check our documentation
          </a>
          .
        </div>
      </ConnectorContent>

      <ConnectorButtonPrimary onClick={() => cancel()}>
        Continue to application
      </ConnectorButtonPrimary>
    </div>
  );
}
