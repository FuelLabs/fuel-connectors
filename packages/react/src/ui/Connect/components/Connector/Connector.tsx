import type { FuelConnector } from 'fuels';
import { useEffect, useMemo, useState } from 'react';

import {
  DialogState,
  useConnectUI,
} from '../../../../providers/FuelUIProvider';
import { ConnectorIcon } from '../ConnectorIcon';

import { Spinner } from '../Spinner/Spinner';
import {
  ConnectorContent,
  ConnectorDescription,
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
    install: { action: actionText, link, description },
  } = connector.metadata;
  const {
    dialog: { state: dialogState, action },
  } = useConnectUI();
  const loading = dialogState === DialogState.CONNECTING;
  const dialogLabels = useMemo(
    () => getDialogLabels(dialogState, connector),
    [dialogState, connector],
  );

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
        <ConnectorDescription>
          {dialogLabels.description || description}
        </ConnectorDescription>
      </ConnectorContent>
      <ConnectorLinkButton
        href={
          !loading && dialogState === DialogState.INSTALL ? link : undefined
        }
        target="_blank"
        onClick={() => !loading && action(connector)}
        aria-disabled={loading}
      >
        {loading && <Spinner size={26} color="var(--fuel-loader-background)" />}
        {!loading && (dialogLabels.buttonLabel || actionText)}
      </ConnectorLinkButton>
    </div>
  );
}
