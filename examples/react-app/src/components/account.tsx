import { useConnect, useDisconnect } from '@fuels/react';
import { useEffect, useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useWallet } from '../hooks/useWallet';
import { Copyable } from './Copyable';
import Button from './button';
import Feature from './feature';

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

export default function ConnectedAccount({ isSigning }: Props) {
  const { account, currentConnector, isConnected } = useWallet();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { explorerUrl } = useConfig();
  const [predicateVersion, setPredicateVersion] = useState<string | null>(null);

  useEffect(() => {
    if (
      currentConnector &&
      isConnected &&
      'getSelectedPredicateVersion' in currentConnector
    ) {
      try {
        // Use a type assertion that's more specific than 'any'
        const connector = currentConnector as {
          getSelectedPredicateVersion: () => string;
        };
        const version = connector.getSelectedPredicateVersion();
        setPredicateVersion(version);
      } catch (error) {
        console.error('Error getting predicate version:', error);
        setPredicateVersion(null);
      }
    } else {
      setPredicateVersion(null);
    }
  }, [currentConnector, isConnected]);

  const explorerAccountUrl = `${explorerUrl}/account/${account}/assets`;

  if (!account && isConnected) {
    return (
      <Feature title="Your Fuel Address">
        Account not connected
        <Button
          onClick={() => connect(currentConnector.name)}
          loadingText="Disconnecting..."
          disabled={isSigning}
        >
          Connect
        </Button>
      </Feature>
    );
  }
  if (!account) return null;

  return (
    <div>
      <Feature title="Your Fuel Address">
        <div
          className="flex items-center space-between"
          style={{ gap: '10px' }}
          id="address"
          data-address={account}
        >
          <code className="block md:hidden">
            {truncAddressMiddle(account, 4)}
          </code>
          <code className="hidden md:block">
            {truncAddressMiddle(account, 8)}
          </code>
          <Copyable value={account} />
        </div>
        {predicateVersion && (
          <div className="mt-2 text-sm">
            <span className="text-zinc-400">Predicate Version:</span>{' '}
            <code>{truncAddressMiddle(predicateVersion, 6)}</code>
            <Button
              onClick={() => {
                if (
                  currentConnector &&
                  'getAllPredicateVersionsWithMetadata' in currentConnector
                ) {
                  // Open the predicate version selector directly
                  // This is a temporary solution until there's a proper API
                  const connectButton = document.querySelector(
                    '[data-fuel-connector="connect-button"]',
                  );
                  if (connectButton) {
                    (connectButton as HTMLElement).click();

                    setTimeout(() => {
                      const selectors = [
                        'button[data-predicate-version="selector"]',
                        '[data-fuel-selector="predicate-version"]',
                        '[data-selector="predicate-version"]',
                      ];

                      for (const selector of selectors) {
                        const versionSelector =
                          document.querySelector(selector);
                        if (versionSelector) {
                          (versionSelector as HTMLElement).click();
                          break;
                        }
                      }
                    }, 200);
                  }
                }
              }}
              style={{
                marginLeft: '10px',
                padding: '4px 8px',
                fontSize: '12px',
                height: 'auto',
              }}
            >
              Change
            </Button>
          </div>
        )}
        <Button
          onClick={() => disconnect()}
          loadingText="Disconnecting..."
          disabled={isSigning}
        >
          Disconnect
        </Button>
      </Feature>
      <a
        href={explorerAccountUrl}
        target="_blank"
        className="underline text-end text-sm text-zinc-300/70"
        rel="noreferrer"
      >
        View on Explorer
      </a>
    </div>
  );
}

function truncAddressMiddle(address: string, size: number) {
  if (!address) return '';
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}
