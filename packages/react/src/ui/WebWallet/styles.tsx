import * as Dialog from '@radix-ui/react-dialog';
import { IconX, type TablerIconsProps } from '@tabler/icons-react';
import type React from 'react';

const OverlayStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '1rem',
  right: '0.5rem',
};
export const Overlay = ({ children }: React.PropsWithChildren) => (
  <div style={OverlayStyle}>{children}</div>
);

const DialogOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  animation: 'fuelOverlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
};
export const DialogOverlay = ({ children }: React.PropsWithChildren) => (
  <Dialog.Overlay style={DialogOverlayStyle}>{children}</Dialog.Overlay>
);

const DialogContentStyle: React.CSSProperties = {
  position: 'fixed',
  height: '700px',
  border: '1px solid var(--fuel-border-color)',
  overflow: 'hidden',
  color: 'var(--fuel-color)',
  userSelect: 'none',
  boxSizing: 'border-box',
  backgroundColor: 'var(--fuel-dialog-background)',
  animation: 'fuelContentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  boxShadow:
    'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
};
export type DialogContentProps = {
  show: boolean;
} & Dialog.DialogContentProps;
export const DialogContent = ({
  show,
  children,
  ...props
}: React.PropsWithChildren<DialogContentProps>) => (
  <Dialog.Content
    style={{
      ...DialogContentStyle,
      visibility: show ? 'visible' : 'hidden',
    }}
    className="fuel-connectors-wallet-dialog-content"
    {...props}
  >
    {children}
  </Dialog.Content>
);

const DialogTitleStyle: React.CSSProperties = {
  padding: '8px 14px 12px',
  margin: 0,
  textAlign: 'center',
  fontSize: '16px',
  letterSpacing: 'var(--fuel-letter-spacing)',
  fontWeight: 700,
};
export const DialogTitle = ({ children }: React.PropsWithChildren) => (
  <Dialog.Title style={DialogTitleStyle}>{children}</Dialog.Title>
);

const DividerStyle: React.CSSProperties = {
  height: '1px',
  width: '100%',
  backgroundColor: 'var(--fuel-border-color)',
  padding: 0,
  boxSizing: 'border-box',
};
export const Divider = () => <div style={DividerStyle} />;

const DialogMainStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  height: '100%',
  padding: '24px 16px',
};
export const DialogMain = ({ children }: React.PropsWithChildren) => (
  <div style={DialogMainStyle}>{children}</div>
);

const FuelRootStyle: React.CSSProperties = {
  position: 'absolute',
  zIndex: 9999,
  fontSize: 'var(--fuel-font-size)',
};
export const FuelRoot = ({
  style,
  children,
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{ ...FuelRootStyle, ...style }}
    className="fuel-connectors-wallet-root"
  >
    {children}
  </div>
);

const DialogTriggerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '30px',
  right: '25px',
  backgroundColor: 'var(--fuel-color)',
  color: 'var(--fuel-dialog-background)',
  padding: '6px 8px',
  borderRadius: '16px',
};
export const DialogTrigger = ({ children }: React.PropsWithChildren) => (
  <Dialog.Trigger
    style={DialogTriggerStyle}
    className="fuel-connectors-dialog-trigger"
  >
    {children}
  </Dialog.Trigger>
);

export const DialogClose = ({
  children,
  ...props
}: React.PropsWithChildren<Dialog.DialogCloseProps>) => (
  <Dialog.Close {...props}>{children}</Dialog.Close>
);

export const VisuallyHidden = ({ children }: React.PropsWithChildren) => (
  <span style={{ visibility: 'hidden' }}>{children}</span>
);

export type ContainerProps = {
  alignItems?: 'center' | 'flex-start' | 'flex-end';
  gap?: string;
  flexDirection?: 'row' | 'column';
};

const ContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: '0',
  alignItems: 'center',
};
export const Container = ({
  alignItems,
  gap,
  flexDirection,
  children,
}: React.PropsWithChildren<ContainerProps>) => (
  <div
    style={{
      ...ContainerStyle,
      ...(flexDirection && { flexDirection }),
      ...(alignItems && { alignItems }),
      ...(gap && { gap }),
    }}
  >
    {children}
  </div>
);

const CloseIconStyle: React.CSSProperties = {
  fill: 'var(--fuel-color)',
  padding: '6px',
  fontFamily: 'inherit',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 700,
  marginTop: '-3px',
  alignSelf: 'flex-start',
};
export const CloseIcon = ({ onClick, ...props }: TablerIconsProps) => (
  <IconX style={CloseIconStyle} onClick={onClick} {...props} />
);
