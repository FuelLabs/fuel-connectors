import type { FuelConnector } from 'fuels';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  DialogState,
  useConnectUI,
} from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../ConnectorIcon';

import { Spinner } from '../Spinner/Spinner';
import {
  ConnectorContent,
  ConnectorDescription,
  ConnectorHelper,
  ConnectorImage,
  ConnectorLinkButton,
  ConnectorTitle,
} from './styles';
import { getDialogLabels } from './utils';

type ConnectorProps = {
  theme?: string;
  className?: string;
  connector: FuelConnector;
};

export function Connector({ className, connector, theme }: ConnectorProps) {
  const {
    install: { action: actionText, link, description: _description },
  } = connector.metadata;
  const {
    dialog: { state: dialogState, action },
    error,
  } = useConnectUI();
  const actionTimeout = useRef<NodeJS.Timeout | null>(null);
  const dialogLabels = useMemo(
    () => getDialogLabels(dialogState, connector, error),
    [dialogState, connector, error],
  );
  const loading = dialogState === DialogState.CONNECTING;

  const handleClick = () => {
    // This exist so that `href` doesn't get invalidated too soon
    if (!loading) {
      actionTimeout.current && clearTimeout(actionTimeout.current);
      actionTimeout.current = setTimeout(() => action(connector));
    }
  };

  return (
    <div className={className}>
      <ConnectorImage>
        <ConnectorIcon
          connectorMetadata={connector.metadata}
          connectorName={connector.name}
          size={100}
          theme={theme}
        />
      </ConnectorImage>
      <ConnectorContent>
        <ConnectorTitle>{dialogLabels.title}</ConnectorTitle>
        <ConnectorDescription isError={dialogState === DialogState.ERROR}>
          {dialogLabels.description || _description}
        </ConnectorDescription>
      </ConnectorContent>
      <ConnectorLinkButton
        href={dialogState === DialogState.INSTALL ? link : undefined}
        target="_blank"
        onClick={handleClick}
        aria-disabled={loading}
      >
        {loading && <Spinner size={26} color="var(--fuel-loader-background)" />}
        {!loading && (dialogLabels.buttonLabel || actionText)}
      </ConnectorLinkButton>
      {dialogState === DialogState.CONNECTING && !connector.installed && (
        <ConnectorHelper>
          If you have installed and is not detected <br /> try refreshing the
          page.
        </ConnectorHelper>
      )}
    </div>
  );
}
