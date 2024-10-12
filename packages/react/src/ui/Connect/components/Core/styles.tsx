import * as Dialog from '@radix-ui/react-dialog';

const dialogOverlayStyle: React.CSSProperties = {
  backgroundColor: 'var(--fuel-overlay-background)',
  position: 'fixed',
  inset: 0,
  animation: 'fuelOverlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
};

export const DialogOverlay = ({ children }: React.PropsWithChildren) => {
  return (
    <Dialog.Overlay style={dialogOverlayStyle} asChild>
      {children}
    </Dialog.Overlay>
  );
};

interface FuelRootProps {
  style: React.CSSProperties;
}

const fuelRootStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  height: '100%',
  width: '100%',
  margin: 0,
  padding: 0,
  zIndex: 99,
  fontFamily: 'var(--fuel-font-family)',
  fontSize: 'var(--fuel-font-size)',
};

export const FuelRoot = ({
  style,
  children,
}: React.PropsWithChildren<FuelRootProps>) => {
  return (
    <div className="fuel-connectors" style={{ ...fuelRootStyle, ...style }}>
      {children}
    </div>
  );
};
