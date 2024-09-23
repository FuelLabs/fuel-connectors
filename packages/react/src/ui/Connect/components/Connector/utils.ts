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
    case DialogState.CONNECTING:
    case DialogState.INSTALLED:
    case DialogState.INSTALL:
      if (connector.installed) {
        return `${connector.name} is Installed!`;
      }
      return `Don't have ${connector.name}?`;
    case DialogState.ERROR:
      return `Failed to connect to ${connector.name}`;
    default:
      return connector.name;
  }
}

function getDescription(dialogState: DialogState, connector: FuelConnector) {
  switch (dialogState) {
    case DialogState.CONNECTING:
    case DialogState.INSTALL:
      if (connector.installed) {
        return `You will be requested to connect it to ${window.location.origin}`;
      }
      return `Install ${connector.name} now by clicking the link bellow and return here to connect it!`;
    case DialogState.INSTALLED:
      return `Click on the button bellow to connect your to ${window.location.origin}`;
    case DialogState.ERROR:
      return 'Click on the button below to try again.';
    default:
      return undefined;
  }
}

export const getDialogLabels: (
  state: DialogState,
  connector: FuelConnector,
) => DialogLabelData = (state, connector) => ({
  title: getTitle(state, connector),
  description: getDescription(state, connector),
  buttonLabel: getButtonLabel(state),
});
