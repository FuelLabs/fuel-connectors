import type { FuelConnector } from 'fuels';
import { useEffect, useState } from 'react';
import { useCurrentConnector, useIsConnected } from '../../../../hooks';
import { Routes, useConnectUI } from '../../../../providers/FuelUIProvider';
import { DialogContent } from '../Core/DialogContent';
import { DialogFuel } from '../Core/DialogFuel';

// TODO: Remove this
import Button from '../../../../../../../examples/react-app/src/components/button';

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

const Header = (props: React.HTMLProps<HTMLDivElement>) => (
  <div
    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    {...props}
  />
);

const Title = (props: React.HTMLProps<HTMLHeadingElement>) => (
  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }} {...props} />
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
}

// Extended interface for PredicateConnector with version selection methods
interface PredicateConnectorWithVersions extends FuelConnector {
  getAvailablePredicateVersions: () => PredicateVersion[];
  getAllPredicateVersionsWithMetadata?: () => VersionWithMetadata[];
  setSelectedPredicateVersion: (versionId: string) => void;
  getSelectedPredicateVersion: () => string | null;
}

// Type guard to check if connector has version selection methods
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

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);

      // If not connected when dialog opens, start waiting
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

  // Poll for connection status when waiting for connection
  useEffect(() => {
    if (!isOpen || !waitingForConnection) {
      return;
    }

    // When connection status changes to connected, stop waiting
    if (isConnected) {
      setWaitingForConnection(false);
      return;
    }

    // Set up polling to check for connection status
    const connectionPoll = setTimeout(() => {
      // We'll rely on isConnected hook to update itself
      // If still not connected after 10 seconds, show error
      if (waitingForConnection) {
        setError('Connection timed out. Please try again.');
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(connectionPoll);
  }, [isOpen, waitingForConnection, isConnected]);

  // Load available predicate versions when connector is available and dialog is open
  useEffect(() => {
    if (!isOpen || !isConnected || !currentConnector) {
      return;
    }

    const loadVersions = async () => {
      setLoading(true);

      try {
        if (hasVersionSupport(currentConnector)) {
          // Try to use the metadata method first
          if (currentConnector.getAllPredicateVersionsWithMetadata) {
            try {
              // Handle the async method properly
              const metadataVersions =
                await currentConnector.getAllPredicateVersionsWithMetadata();
              setVersionsWithMetadata(metadataVersions);
              setVersions(metadataVersions); // For backwards compatibility

              // Find the selected version from metadata
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
              // Fall back to the regular method
              const availableVersions =
                currentConnector.getAvailablePredicateVersions();
              setVersions(availableVersions);
              setVersionsWithMetadata([]);
              setSelectedVersion(
                currentConnector.getSelectedPredicateVersion(),
              );
            }
          } else {
            // Fallback to the regular method
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

  // Function to handle version selection
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

  // Helper function to format timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  // Helper function to format version ID
  const formatVersionId = (id: string) => {
    if (!id) return '';
    return `${id.substring(0, 10)}...${id.substring(id.length - 8)}`;
  };

  // Handle confirmation and close the dialog
  const handleConfirm = () => {
    // If there's a selected version and we haven't applied it yet, apply it
    if (
      selectedVersion &&
      currentConnector &&
      hasVersionSupport(currentConnector)
    ) {
      // Make sure the selection is applied before closing
      try {
        currentConnector.setSelectedPredicateVersion(selectedVersion);
      } catch (err) {
        console.error('Failed to set predicate version before closing:', err);
      }
    }

    // Now close the dialog
    cancel();
  };

  // Handle closing without applying changes (for error states, etc.)
  const handleClose = () => {
    // Close the entire dialog when done with version selection
    cancel();
  };

  // Show loading state
  const renderLoadingState = () => (
    <Container>
      <Header>
        <Title>Loading Predicate Versions</Title>
        <Description>
          Please wait while we load available versions...
        </Description>
      </Header>
    </Container>
  );

  // Show empty state if no versions available
  const renderEmptyState = () => (
    <Container>
      <Header>
        <Title>Predicate Versions</Title>
        <Description>
          No additional predicate versions were found for this wallet. Your
          wallet is using the default version.
        </Description>
      </Header>
      <Button type="button" onClick={handleClose}>
        Close
      </Button>
    </Container>
  );

  // Show error state
  const renderErrorState = () => (
    <Container>
      <Header>
        <Title>Error Loading Versions</Title>
        <Description>{error}</Description>
      </Header>
      <Button type="button" onClick={handleClose}>
        Close
      </Button>
    </Container>
  );

  // Render loading with connection message when waiting for connection
  const renderConnectionWaiting = () => (
    <Container>
      <Header>
        <Title>Connecting to Wallet</Title>
        <Description>
          Please complete the connection in your wallet...
        </Description>
      </Header>
    </Container>
  );

  // Don't return null when waiting for connection - allow the waiting state to render
  if ((!isConnected || !currentConnector) && !waitingForConnection) {
    return null;
  }

  return (
    <DialogFuel open={isOpen} theme={theme}>
      <DialogContent>
        <DialogMain>
          {waitingForConnection ? (
            renderConnectionWaiting()
          ) : loading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : versions.length > 0 ? (
            <Container>
              <Header>
                <Title>Select Predicate Version</Title>
                <Description>
                  Choose which predicate version to use with your wallet.
                  {versions.length > 1
                    ? ` ${versions.length} versions available. Older versions may have funds associated with them.`
                    : ' Only one version available.'}
                </Description>
              </Header>
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
                            <span
                              style={{
                                fontSize: '11px',
                                color: 'var(--fuel-accent-color)',
                              }}
                            >
                              Has balance
                            </span>
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
