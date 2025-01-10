import * as Dialog from '@radix-ui/react-dialog';

const dialogContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  color: 'var(--fuel-color)',
  userSelect: 'none',
  maxHeight: 'calc(100% - 20px)',
  backgroundColor: 'var(--fuel-dialog-background)',
  position: 'fixed',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  borderRadius: '36px',
  padding: '14px 0px',
  paddingBottom: '36px',
  animation: 'fuelContentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  top: '50%',
  width: '360px',
  maxWidth: 'calc(100% - 20px)',
  boxShadow:
    'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
};

export const DialogContent = (props: Dialog.DialogContentProps) => {
  return (
    <Dialog.Content
      style={dialogContentStyle}
      {...props}
      className="fuel-connectors-dialog-content"
      // Workaround to prevent closing dialog when interacting with WalletConnect Modal
      onPointerDownOutside={(e) => {
        const walletConnectDialog = document.querySelector('w3m-modal');
        if (walletConnectDialog?.classList.contains('open')) {
          e.preventDefault();
        }
      }}
    />
  );
};
