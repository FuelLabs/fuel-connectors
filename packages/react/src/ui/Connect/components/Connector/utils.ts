import type { FuelConnector } from 'fuels';
import { DialogState } from '../../../../providers/FuelUIProvider';

interface DialogLabelData {
  title: string;
  description?: string;
  buttonLabel?: string;
}

function getButtonLabel(dialogState: DialogState) {
  switch (dialogState) {
    case DialogState.INSTALL:
      return 'Install';
    case DialogState.INSTALLED:
      return 'Connect';
    case DialogState.ERROR:
      return 'Retry';
    default:
      return undefined;
  }
}

function getTitle(dialogState: DialogState, connector: FuelConnector) {
  switch (dialogState) {
    case DialogState.ERROR:
    case DialogState.CONNECTING:
      return connector.name;
    case DialogState.INSTALLED:
      return `${connector.name} is Installed!`;
    case DialogState.INSTALL:
      return `Don't have ${connector.name}?`;
    default:
      return connector.name;
  }
}

function getDescription(
  dialogState: DialogState,
  connector: FuelConnector,
  error: Error | null,
) {
  switch (dialogState) {
    case DialogState.CONNECTING:
      return `Connecting to ${connector.name}`;
    case DialogState.INSTALL:
      return 'Install now by clicking the link bellow and return here to connect it!';
    case DialogState.INSTALLED:
      return `Click on the button bellow to connect your wallet to ${window.location.origin}`;
    case DialogState.ERROR:
      return error?.message || 'Connection failed.';
    default:
      return undefined;
  }
}

export const getDialogLabels: (
  state: DialogState,
  connector: FuelConnector,
  error: Error | null,
) => DialogLabelData = (state, connector, error) => ({
  title: getTitle(state, connector),
  description: getDescription(state, connector, error),
  buttonLabel: getButtonLabel(state),
});
