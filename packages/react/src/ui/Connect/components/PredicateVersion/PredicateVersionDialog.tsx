import * as Dialog from '@radix-ui/react-dialog';
import type { FuelConnector } from 'fuels';
import { useCallback, useEffect, useState } from 'react';
import { useCurrentConnector, useIsConnected } from '../../../../hooks';
import { Routes, useConnectUI } from '../../../../providers/FuelUIProvider';
import { DialogContent } from '../Core/DialogContent';
import { DialogFuel } from '../Core/DialogFuel';

// TODO: Remove this
import Button from '../../../../../../../examples/react-app/src/components/button';
import { CloseIcon, DialogHeader, DialogTitle, Divider } from '../../styles';
import { connectorItemStyle } from '../Connectors/styles';

// Base asset ID (ETH) - this is the default zero-bytes32 asset ID
const BASE_ASSET_ID =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

// Utility function to format number with appropriate scale
const formatCompactBalance = (balance: string) => {
  try {
    // Remove any non-numeric characters except decimal points
    const cleanedBalance = balance.replace(/[^\d.]/g, '');
    const num = Number.parseFloat(cleanedBalance);

    if (Number.isNaN(num)) return '0';

    if (num === 0) return '0';
    if (num < 0.001) return '<0.001';
    if (num < 1) return num.toFixed(3);
    if (num < 1000) return num.toFixed(2);
    if (num < 10000) return num.toFixed(1);
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  } catch (_e) {
    return balance;
  }
};

const isBaseAsset = (assetId?: string) => {
  return assetId === BASE_ASSET_ID;
};

const Container = (props: React.HTMLProps<HTMLDivElement>) => (
  <div
    style={{
      padding: '16px',
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
      padding: '0px 14px',
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

  // Define loadVersionMetadata as a useCallback to handle dependencies
  const loadVersionMetadata = useCallback(async () => {
    if (!currentConnector || !hasVersionSupport(currentConnector)) {
      return;
    }

    try {
      if (currentConnector.getAllPredicateVersionsWithMetadata) {
        const metadataVersions =
          await currentConnector.getAllPredicateVersionsWithMetadata();

        // Sort versions to prioritize ones with balances, particularly base asset balances
        const sortedVersions = [...metadataVersions].sort((a, b) => {
          // First priority: user's selected version
          if (a.isSelected !== b.isSelected) {
            return a.isSelected ? -1 : 1;
          }

          // Second priority: versions with base asset
          const aHasBaseAsset = isBaseAsset(a.assetId);
          const bHasBaseAsset = isBaseAsset(b.assetId);
          if (aHasBaseAsset !== bHasBaseAsset) {
            return aHasBaseAsset ? -1 : 1;
          }

          // Third priority: any version with balance
          if (a.isActive !== b.isActive) {
            return a.isActive ? -1 : 1;
          }

          // Final priority: newest versions
          if (a.isNewest !== b.isNewest) {
            return a.isNewest ? -1 : 1;
          }

          // Default to generatedAt (newest first)
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

  // Load basic versions when the dialog opens and we have a connector
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

          // Set the first version (newest) as default selection if none is already selected
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
      setError(null);
    } catch (err) {
      console.error('Failed to set predicate version:', err);
      setError('Failed to set predicate version. Please try again.');
    }
  };

  const formatVersionId = (id: string) => {
    if (!id) return '';
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
      <DialogTitle>Loading Predicate Versions</DialogTitle>
      <Description>Please wait while we load available versions...</Description>
    </>
  );

  const renderEmptyState = () => (
    <>
      <DialogTitle>Predicate Versions</DialogTitle>
      <Description>
        No additional predicate versions were found for this wallet. Your wallet
        is using the default version.
      </Description>
    </>
  );

  const renderErrorState = () => (
    <>
      <DialogTitle>Error Loading Versions</DialogTitle>
      <Description>{error}</Description>
    </>
  );

  return (
    <DialogFuel open={isOpen} theme={theme}>
      <DialogContent>
        <DialogHeader>
          {loading ? (
            renderLoadingState()
          ) : versions.length === 0 ? (
            renderEmptyState()
          ) : error ? (
            renderErrorState()
          ) : (
            <DialogTitle>Select Predicate Version</DialogTitle>
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
                Select a predicate version for your wallet. Predicate versions
                evolve with the Fuel Network and Sway updates, bringing new
                features and bug fixes. We recommend using the latest version
                when possible. A predicate upgrade tool will be available soon.
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

              <VersionList>
                {(versionsWithMetadata.length > 0
                  ? versionsWithMetadata
                  : versions
                ).map((version) => {
                  const hasMetadata = 'isSelected' in version;
                  const versionWithMeta = hasMetadata
                    ? (version as PredicateVersionWithMetadata)
                    : null;

                  return (
                    <VersionItem
                      key={version.id}
                      selected={version.id === selectedVersion}
                      onClick={() => handleVersionSelect(version.id)}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <VersionLabel>
                          {formatVersionId(version.id)}
                        </VersionLabel>
                        {versionWithMeta?.isNewest && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--fuel-accent-color)',
                            }}
                          >
                            Latest version
                          </span>
                        )}
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
              <Button type="button" onClick={handleConfirm}>
                Confirm Selection
              </Button>
            </Container>
          ) : null}
        </DialogMain>
      </DialogContent>
    </DialogFuel>
  );
}
