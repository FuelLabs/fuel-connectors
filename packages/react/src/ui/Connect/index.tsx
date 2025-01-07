import * as Dialog from '@radix-ui/react-dialog';

import { Routes, useConnectUI } from '../../providers/FuelUIProvider';
import { Connector } from './components/Connector/Connector';
import { Connectors } from './components/Connectors';
import {
  BackIcon,
  CloseIcon,
  DialogHeader,
  DialogMain,
  DialogTitle,
  Divider,
} from './styles';

import { Connecting } from './components/Connector/Connecting';
import { DialogContent } from './components/Core/DialogContent';
import { DialogFuel } from './components/Core/DialogFuel';
import { ExternalDisclaimer } from './components/ExternalDisclaimer/ExternalDisclaimer';
import { PreSignatureDialog } from './components/PreSignature/PreSignatureDialog';

const ConnectRoutes = ({ route }: { route: Routes }) => {
  switch (route) {
    case Routes.LIST:
      return <Connectors />;
    case Routes.INSTALL:
      return <Connector />;
    case Routes.EXTERNAL_DISCLAIMER:
      return <ExternalDisclaimer />;
    case Routes.PRESIGNATURE:
      return <PreSignatureDialog />;
    case Routes.CONNECTING:
      return <Connecting />;
    default:
      return null;
  }
};

export function Connect() {
  const {
    theme,
    cancel,
    dialog: { isOpen, route, connector, back },
  } = useConnectUI();

  const handleOpenChange = (openState: boolean) => {
    if (!openState) cancel();
  };

  return (
    <DialogFuel open={isOpen} theme={theme} onOpenChange={handleOpenChange}>
      <DialogContent data-connector={!!connector}>
        <DialogHeader>
          <BackIcon size={32} onClick={back} data-connector={!!connector} />
          <DialogTitle>Connect Wallet</DialogTitle>
          <Dialog.Close asChild>
            <CloseIcon size={32} onClick={() => cancel()} />
          </Dialog.Close>
        </DialogHeader>
        <Divider />
        <DialogMain>
          <ConnectRoutes route={route} />
        </DialogMain>
      </DialogContent>
    </DialogFuel>
  );
}
