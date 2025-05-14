import * as Dialog from '@radix-ui/react-dialog';
import type { FuelConnector } from 'fuels';
import { useEffect, useState } from 'react';
import { useCurrentConnector, useIsConnected } from '../../../../hooks';
import { Routes, useConnectUI } from '../../../../providers/FuelUIProvider';
import { DialogContent } from '../Core/DialogContent';
import { DialogFuel } from '../Core/DialogFuel';

// TODO: Remove this
import Button from '../../../../../../../examples/react-app/src/components/button';
import { CloseIcon, DialogHeader, DialogTitle, Divider } from '../../styles';

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
    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    {...props}
  />
);

const VersionItem = ({
  selected,
  onClick,
  ...props
}: React.HTMLProps<HTMLDivElement> & { selected?: boolean }) => (
  <div
    style={{
      padding: '12px',
      borderRadius: '8px',
      backgroundColor: selected ? 'var(--fuel-gray-3)' : 'var(--fuel-gray-2)',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
    }}
    onClick={onClick}
    {...props}
  />
);

const VersionLabel = (props: React.HTMLProps<HTMLSpanElement>) => (
  <span style={{ fontSize: '14px', fontWeight: '600' }} {...props} />
);

const DateLabel = (props: React.HTMLProps<HTMLSpanElement>) => (
  <span style={{ fontSize: '12px', color: 'var(--fuel-gray-10)' }} {...props} />
);

const BalanceLabel = (props: React.HTMLProps<HTMLSpanElement>) => (
  <span
    style={{
      fontSize: '11px',
      color: 'var(--fuel-green-11)',
      display: 'block',
      marginTop: '2px',
    }}
    {...props}
  />
);

type PredicateVersionProps = {
  theme: 'dark' | 'light';
};

interface PredicateVersion {
  id: string;
  generatedAt: number;
}

interface VersionWithMetadata extends PredicateVersion {
  isActive: boolean;
  isSelected: boolean;
  isNewest: boolean;
  balance?: string;
  assetId?: string;
}

//
interface PredicateConnectorWithVersions extends FuelConnector {
  getAvailablePredicateVersions: () => PredicateVersion[];
  getAllPredicateVersionsWithMetadata?: () => VersionWithMetadata[];
  setSelectedPredicateVersion: (versionId: string) => void;
  getSelectedPredicateVersion: () => string | null;
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
  const { isConnected } = useIsConnected();
  const { currentConnector } = useCurrentConnector();
  const {
    dialog: { route },
    cancel,
  } = useConnectUI();
  const [versions, setVersions] = useState<PredicateVersion[]>([]);
  const [versionsWithMetadata, setVersionsWithMetadata] = useState<
    VersionWithMetadata[]
  >([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [waitingForConnection, setWaitingForConnection] =
    useState<boolean>(false);
  const isOpen = route === Routes.PredicateVersionSelector;

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);

      if (!isConnected) {
        setWaitingForConnection(true);
      } else {
        setWaitingForConnection(false);
      }
    } else {
      setVersions([]);
      setVersionsWithMetadata([]);
      setSelectedVersion(null);
      setError(null);
      setLoading(false);
      setWaitingForConnection(false);
    }
  }, [isOpen, isConnected]);

  useEffect(() => {
    if (!isOpen || !waitingForConnection) {
      return;
    }

    if (isConnected) {
      setWaitingForConnection(false);
      return;
    }

    const connectionPoll = setTimeout(() => {
      if (waitingForConnection) {
        setError('Connection timed out. Please try again.');
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(connectionPoll);
  }, [isOpen, waitingForConnection, isConnected]);

  useEffect(() => {
    if (!isOpen || !isConnected || !currentConnector) {
      return;
    }

    const loadVersions = async () => {
      setLoading(true);

      try {
        if (hasVersionSupport(currentConnector)) {
          if (currentConnector.getAllPredicateVersionsWithMetadata) {
            try {
              const metadataVersions =
                await currentConnector.getAllPredicateVersionsWithMetadata();
              setVersionsWithMetadata(metadataVersions);
              setVersions(metadataVersions);

              const selected = metadataVersions.find((v) => v.isSelected);
              if (selected) {
                setSelectedVersion(selected.id);
              } else {
                setSelectedVersion(
                  currentConnector.getSelectedPredicateVersion(),
                );
              }
            } catch (err) {
              console.error(
                'Error fetching predicate versions with metadata:',
                err,
              );

              const availableVersions =
                currentConnector.getAvailablePredicateVersions();
              setVersions(availableVersions);
              setVersionsWithMetadata([]);
              setSelectedVersion(
                currentConnector.getSelectedPredicateVersion(),
              );
            }
          } else {
            const availableVersions =
              currentConnector.getAvailablePredicateVersions();
            setVersions(availableVersions);
            setVersionsWithMetadata([]);
            setSelectedVersion(currentConnector.getSelectedPredicateVersion());
          }
          setError(null);
        } else {
          setError("This wallet doesn't support predicate version selection");
          setVersions([]);
          setVersionsWithMetadata([]);
        }
      } catch (err) {
        console.error('Failed to load predicate versions:', err);
        setError('Failed to load predicate versions. Please try again.');
        setVersions([]);
        setVersionsWithMetadata([]);
      } finally {
        setLoading(false);
      }
    };

    loadVersions();
  }, [currentConnector, isConnected, isOpen]);

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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const formatVersionId = (id: string) => {
    if (!id) return '';
    return `${id.substring(0, 10)}...${id.substring(id.length - 8)}`;
  };

  const handleConfirm = () => {
    if (
      selectedVersion &&
      currentConnector &&
      hasVersionSupport(currentConnector)
    ) {
      try {
        currentConnector.setSelectedPredicateVersion(selectedVersion);
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

  const renderConnectionWaiting = () => (
    <>
      <DialogTitle>Connecting to Wallet</DialogTitle>
      <Description>
        Please complete the connection in your wallet...
      </Description>
    </>
  );

  if ((!isConnected || !currentConnector) && !waitingForConnection) {
    return null;
  }

  return (
    <DialogFuel open={isOpen} theme={theme}>
      <DialogContent>
        <DialogHeader>
          {waitingForConnection ? (
            renderConnectionWaiting()
          ) : loading ? (
            renderLoadingState()
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
                ).map((version) => (
                  <VersionItem
                    key={version.id}
                    selected={version.id === selectedVersion}
                    onClick={() => handleVersionSelect(version.id)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <VersionLabel>{formatVersionId(version.id)}</VersionLabel>
                      <DateLabel>{formatDate(version.generatedAt)}</DateLabel>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                      }}
                    >
                      {version.id === selectedVersion && (
                        <span
                          style={{
                            fontSize: '12px',
                            color: 'var(--fuel-green-11)',
                          }}
                        >
                          Selected
                        </span>
                      )}
                      {(() => {
                        // Type-safe check for isNewest property
                        const versionWithMetadata =
                          version as Partial<VersionWithMetadata>;
                        if (versionWithMetadata.isNewest) {
                          return (
                            <span
                              style={{
                                fontSize: '11px',
                                color: 'var(--fuel-blue-11)',
                              }}
                            >
                              Newest
                            </span>
                          );
                        }
                        return null;
                      })()}
                      {(() => {
                        // Type-safe check for isActive property
                        const versionWithMetadata =
                          version as Partial<VersionWithMetadata>;
                        if (versionWithMetadata.isActive) {
                          return (
                            <>
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--fuel-accent-color)',
                                }}
                              >
                                Has balance
                              </span>
                              {versionWithMetadata.balance && (
                                <BalanceLabel>
                                  {versionWithMetadata.balance}
                                </BalanceLabel>
                              )}
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </VersionItem>
                ))}
              </VersionList>
              <Button type="button" onClick={handleConfirm}>
                Confirm
              </Button>
            </Container>
          ) : (
            renderEmptyState()
          )}
        </DialogMain>
      </DialogContent>
    </DialogFuel>
  );
}
