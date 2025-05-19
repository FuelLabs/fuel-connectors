import * as Dialog from '@radix-ui/react-dialog';
import type { FuelConnector } from 'fuels';
import { bn } from 'fuels';
import { useCallback, useEffect, useState } from 'react';
import { useCurrentConnector, useIsConnected } from '../../../../hooks';
import { Routes, useConnectUI } from '../../../../providers/FuelUIProvider';
import { ConnectorButtonPrimary } from '../Connector/styles';
import { DialogContent } from '../Core/DialogContent';
import { DialogFuel } from '../Core/DialogFuel';

import {
  BackIcon,
  CloseIcon,
  DialogHeader,
  DialogTitle,
  Divider,
} from '../../styles';
import { connectorItemStyle } from '../Connectors/styles';

// LocalStorage key for selected predicate version
const SELECTED_PREDICATE_KEY = 'fuel_selected_predicate_version';

const formatCompactBalance = (balance: string) => {
  try {
    const cleanedBalance = balance.replace(/[^\d.]/g, '');
    const bnValue = bn(cleanedBalance);

    if (bnValue.eq(0)) return '0';

    const numValue = Number(bnValue.format());

    if (numValue < 0.001) return '<0.001';
    if (numValue < 1) return numValue.toFixed(3);
    if (numValue < 1000) return numValue.toFixed(2);
    if (numValue < 10000) return numValue.toFixed(1);
    if (numValue < 1000000) return `${(numValue / 1000).toFixed(1)}K`;
    return `${(numValue / 1000000).toFixed(1)}M`;
  } catch (_e) {
    return balance;
  }
};

const Container = (props: React.HTMLProps<HTMLDivElement>) => (
  <div
    style={{
      padding: '0 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}
    {...props}
  />
);

const Description = (props: React.HTMLProps<HTMLParagraphElement>) => (
  <p
    style={{ margin: 0, fontSize: '14px', color: 'var(--fuel-gray-11)' }}
    {...props}
  />
);

const DialogMain = (props: React.HTMLProps<HTMLDivElement>) => (
  <div style={{ maxWidth: '400px', width: '100%' }} {...props} />
);

const VersionList = (props: React.HTMLProps<HTMLDivElement>) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--fuel-items-gap)',
    }}
    {...props}
  />
);

const VersionItem = ({
  selected,
  onClick,
  children,
}: React.HTMLProps<HTMLDivElement> & { selected: boolean }) => (
  <div
    style={{
      ...connectorItemStyle,
      border: '1px solid var(--fuel-blue-11)',
      borderColor: selected ? 'var(--fuel-blue-11)' : 'transparent',
    }}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
    }}
    tabIndex={0}
    role="button"
    aria-selected={selected}
    className="fuel-connectors-connector-item"
  >
    {children}
  </div>
);

const VersionLabel = (props: React.HTMLProps<HTMLSpanElement>) => (
  <span style={{ fontSize: '0.875em', fontWeight: '500' }} {...props} />
);

const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'latest' | 'current';
}) => {
  let backgroundColor = 'var(--fuel-blue-5)';
  let textColor = 'var(--fuel-blue-11)';

  if (variant === 'latest') {
    backgroundColor = 'var(--fuel-accent-background)';
    textColor = 'var(--fuel-accent-color)';
  } else if (variant === 'current') {
    backgroundColor = 'var(--fuel-blue-5)';
    textColor = 'var(--fuel-blue-11)';
  }

  return (
    <span
      style={{
        fontSize: '11px',
        padding: '2px 6px',
        backgroundColor: backgroundColor,
        color: textColor,
        borderRadius: 'var(--fuel-border-radius)',
        fontWeight: '500',
        marginTop: '2px',
        display: 'inline-block',
        marginRight: '4px',
      }}
    >
      {children}
    </span>
  );
};

const BalanceBadge = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      fontSize: '12px',
      padding: '2px 8px',
      borderRadius: 'var(--fuel-border-radius)',
      marginTop: '2px',
      display: 'inline-block',
      fontWeight: '500',
    }}
  >
    {children}
  </span>
);

type PredicateVersion = {
  id: string;
  generatedAt: number;
};

type PredicateVersionProps = {
  theme: 'dark' | 'light';
};

type PredicateVersionWithMetadata = PredicateVersion & {
  isActive: boolean;
  isSelected: boolean;
  isNewest: boolean;
  balance?: string;
  assetId?: string;
  accountAddress?: string;
};

interface PredicateConnectorWithVersions extends FuelConnector {
  getAvailablePredicateVersions: () => PredicateVersion[];
  setSelectedPredicateVersion: (id: string) => void;
  getSelectedPredicateVersion: () => string;
  getAllPredicateVersionsWithMetadata?: () => Promise<
    PredicateVersionWithMetadata[]
  >;
}

function hasVersionSupport(
  connector: FuelConnector | null,
): connector is PredicateConnectorWithVersions {
  return (
    !!connector &&
    'getAvailablePredicateVersions' in connector &&
    typeof (connector as Partial<PredicateConnectorWithVersions>)
      .getAvailablePredicateVersions === 'function' &&
    'setSelectedPredicateVersion' in connector &&
    typeof (connector as Partial<PredicateConnectorWithVersions>)
      .setSelectedPredicateVersion === 'function' &&
    'getSelectedPredicateVersion' in connector &&
    typeof (connector as Partial<PredicateConnectorWithVersions>)
      .getSelectedPredicateVersion === 'function'
  );
}

export function PredicateVersionDialog({ theme }: PredicateVersionProps) {
  const connectUI = useConnectUI();
  const route = connectUI.dialog.route;
  const cancel = connectUI.cancel;
  const back = connectUI.dialog.back;

  const [versions, setVersions] = useState<PredicateVersion[]>([]);
  const [versionsWithMetadata, setVersionsWithMetadata] = useState<
    PredicateVersionWithMetadata[]
  >([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentConnectorResult = useCurrentConnector();
  const isConnectedResult = useIsConnected();

  const currentConnector =
    connectUI.dialog.connector || currentConnectorResult.currentConnector;
  const isConnected = isConnectedResult.isConnected;

  const isOpen = route === Routes.PredicateVersionSelector;

  useEffect(() => {
    if (currentConnector && hasVersionSupport(currentConnector)) {
      try {
        const savedPredicateVersion = localStorage.getItem(
          SELECTED_PREDICATE_KEY,
        );
        if (savedPredicateVersion) {
          currentConnector.setSelectedPredicateVersion(savedPredicateVersion);
          setSelectedVersion(savedPredicateVersion);
        }
      } catch (err) {
        console.error('Error loading saved predicate version:', err);
      }
    }
  }, [currentConnector]);

  const loadVersionMetadata = useCallback(async () => {
    if (!currentConnector || !hasVersionSupport(currentConnector)) {
      return;
    }

    try {
      if (currentConnector.getAllPredicateVersionsWithMetadata) {
        const metadataVersions =
          await currentConnector.getAllPredicateVersionsWithMetadata();

        const sortedVersions = [...metadataVersions].sort((a, b) => {
          return b.generatedAt - a.generatedAt;
        });

        setVersionsWithMetadata(sortedVersions);

        const selected = sortedVersions.find((v) => v.isSelected);
        if (selected) {
          setSelectedVersion(selected.id);
        }
      }
    } catch (err) {
      console.error('Error fetching predicate versions with metadata:', err);
    }
  }, [currentConnector]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !currentConnector) {
      return;
    }

    const loadBasicVersions = async () => {
      try {
        if (hasVersionSupport(currentConnector)) {
          const availableVersions =
            currentConnector.getAvailablePredicateVersions();
          setVersions(availableVersions);

          const currentSelected =
            currentConnector.getSelectedPredicateVersion();
          if (currentSelected) {
            setSelectedVersion(currentSelected);
          } else if (availableVersions.length > 0) {
            setSelectedVersion(availableVersions[0].id);
          }

          setLoading(false);

          if (isConnected) {
            loadVersionMetadata();
          }
        } else {
          setError(
            'This connector does not support predicate version selection.',
          );
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load predicate versions:', err);
        setError('Failed to load predicate versions. Please try again.');
        setVersions([]);
        setVersionsWithMetadata([]);
        setLoading(false);
      }
    };

    loadBasicVersions();
  }, [currentConnector, isOpen, isConnected, loadVersionMetadata]);

  useEffect(() => {
    if (
      isConnected &&
      currentConnector &&
      hasVersionSupport(currentConnector)
    ) {
      loadVersionMetadata();
    }
  }, [isConnected, currentConnector, loadVersionMetadata]);

  const handleVersionSelect = (versionId: string) => {
    if (!currentConnector || !hasVersionSupport(currentConnector)) {
      return;
    }

    try {
      currentConnector.setSelectedPredicateVersion(versionId);
      setSelectedVersion(versionId);

      try {
        localStorage.setItem(SELECTED_PREDICATE_KEY, versionId);
      } catch (storageError) {
        console.error(
          'Failed to save predicate version to localStorage:',
          storageError,
        );
      }

      setError(null);
    } catch (err) {
      console.error('Failed to set predicate version:', err);
      setError('Failed to set predicate version. Please try again.');
    }
  };

  const formatAddressOrId = (id: string, accountAddress?: string) => {
    if (!id) return '';

    if (accountAddress) {
      if (accountAddress.startsWith('0x') && accountAddress.length >= 10) {
        return `${accountAddress.slice(0, 6)}....${accountAddress.slice(-4)}`;
      }
      return accountAddress;
    }

    return `${id.substring(0, 10)}...${id.substring(id.length - 8)}`;
  };

  const renderBalanceInfo = (version: PredicateVersionWithMetadata) => {
    if (!version.isActive || !version.balance) return null;

    const formattedBalance = formatCompactBalance(version.balance);

    return <BalanceBadge>{formattedBalance} ETH</BalanceBadge>;
  };

  const handleConfirm = () => {
    if (
      selectedVersion &&
      currentConnector &&
      hasVersionSupport(currentConnector)
    ) {
      try {
        const previousVersion = currentConnector.getSelectedPredicateVersion();

        if (previousVersion === selectedVersion) {
          console.log('Same predicate version selected, no changes needed');
          cancel();
          return;
        }

        currentConnector.setSelectedPredicateVersion(selectedVersion);

        try {
          localStorage.setItem(SELECTED_PREDICATE_KEY, selectedVersion);
        } catch (storageError) {
          console.error(
            'Failed to save predicate version to localStorage:',
            storageError,
          );
        }

        if ('emitAccountChange' in currentConnector) {
          try {
            const connectorWithEmit = currentConnector as {
              emitAccountChange: (
                id: string,
                connected: boolean,
              ) => Promise<void>;
            };

            connectorWithEmit
              .emitAccountChange(selectedVersion, true)
              .then(() => {
                console.log(
                  'Successfully switched predicate version with live account update',
                );
              })
              .catch(() => {
                console.log(
                  'Live account update failed, disconnecting to apply new predicate version',
                );
                setTimeout(() => {
                  currentConnector.disconnect().then(() => {
                    console.log('Disconnected to apply new predicate version');
                  });
                }, 500);
              });
          } catch (_emitError) {
            console.log(
              'Live account update failed, disconnecting to apply new predicate version',
            );
            setTimeout(() => {
              currentConnector.disconnect().then(() => {
                console.log('Disconnected to apply new predicate version');
              });
            }, 500);
          }
        } else {
          console.log(
            'Connector does not support live updates, disconnecting to apply new predicate version',
          );
          setTimeout(() => {
            currentConnector.disconnect().then(() => {
              console.log('Disconnected to apply new predicate version');
            });
          }, 500);
        }

        console.log(
          'Predicate version updated from',
          previousVersion,
          'to',
          selectedVersion,
        );
      } catch (err) {
        console.error('Failed to set predicate version before closing:', err);
      }
    }

    cancel();
  };

  const renderLoadingState = () => (
    <>
      <DialogTitle>Loading Fuel Accounts</DialogTitle>
      <Description>Please wait while we load available accounts...</Description>
    </>
  );

  const renderEmptyState = () => (
    <>
      <DialogTitle>Fuel Accounts</DialogTitle>
      <Description>
        No additional Fuel accounts were found for this wallet. Your wallet is
        using the default account.
      </Description>
    </>
  );

  const renderErrorState = () => (
    <>
      <DialogTitle>Error Loading Accounts</DialogTitle>
      <Description>{error}</Description>
    </>
  );

  return (
    <DialogFuel open={isOpen} theme={theme}>
      <DialogContent>
        <DialogHeader>
          <BackIcon size={32} onClick={back} data-connector={true} />

          {loading ? (
            renderLoadingState()
          ) : versions.length === 0 ? (
            renderEmptyState()
          ) : error ? (
            renderErrorState()
          ) : (
            <DialogTitle>Select Fuel Account</DialogTitle>
          )}
          <Dialog.Close asChild>
            <CloseIcon size={32} onClick={() => cancel()} />
          </Dialog.Close>
        </DialogHeader>
        <Divider />
        <DialogMain>
          {versions.length > 0 ? (
            <Container>
              <Description>
                Select a Fuel Account to use. We recommend using the latest
                version when possible as they can bring new features and bug
                fixes.
              </Description>

              <VersionList>
                {(versionsWithMetadata.length > 0
                  ? versionsWithMetadata
                  : versions
                ).map((version) => {
                  const hasMetadata = 'isSelected' in version;
                  const versionWithMeta = hasMetadata
                    ? (version as PredicateVersionWithMetadata)
                    : null;
                  const currentlyActive = versionWithMeta?.isSelected;
                  const isLatest = versionWithMeta?.isNewest;

                  return (
                    <VersionItem
                      key={version.id}
                      selected={version.id === selectedVersion}
                      onClick={() => handleVersionSelect(version.id)}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <VersionLabel>
                          {formatAddressOrId(
                            version.id,
                            versionWithMeta?.accountAddress,
                          )}
                        </VersionLabel>
                        <div style={{ display: 'flex', marginTop: '4px' }}>
                          {isLatest && (
                            <Badge variant="latest">Latest version</Badge>
                          )}
                          {currentlyActive && (
                            <Badge variant="current">Currently selected</Badge>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          marginLeft: 'auto',
                        }}
                      >
                        {versionWithMeta && renderBalanceInfo(versionWithMeta)}
                      </div>
                    </VersionItem>
                  );
                })}
              </VersionList>
              <Description>
                <br />A Fuel account upgrade tool will be available soon.
                <br />
                <a
                  href="https://docs.fuel.network/guides/fuel-connectors/non-technical-guide/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--fuel-blue-11)' }}
                >
                  Learn more about Fuel Predicate connectors.
                </a>
              </Description>
              <ConnectorButtonPrimary onClick={handleConfirm}>
                Confirm Selection
              </ConnectorButtonPrimary>
            </Container>
          ) : null}
        </DialogMain>
      </DialogContent>
    </DialogFuel>
  );
}
