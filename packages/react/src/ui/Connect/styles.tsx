import * as Dialog from '@radix-ui/react-dialog';

import { BackIcon as CBackIcon } from '../../icons/BackIcon';
import { CloseIcon as CCloseIcon } from '../../icons/CloseIcon';
import type { SvgIconProps } from '../../types';

const dialogHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingLeft: '16px',
  paddingRight: '16px',
};

export const DialogHeader = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div style={dialogHeaderStyle} {...props}>
      {children}
    </div>
  );
};

const dialogTitleStyle: React.CSSProperties = {
  padding: '8px 14px 12px',
  margin: 0,
  textAlign: 'center',
  fontSize: 'var(--fuel-font-size)',
  fontWeight: 500,
};

export const DialogTitle = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <Dialog.Title style={dialogTitleStyle} {...props}>
      {children}
    </Dialog.Title>
  );
};

const dividerStyle: React.CSSProperties = {
  height: '1px',
  width: '100%',
  backgroundColor: 'var(--fuel-border-color)',
  margin: '10px 0',
  padding: 0,
};

export const Divider = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return <div style={dividerStyle} {...props} />;
};

const dialogMainStyle: React.CSSProperties = {
  position: 'relative',
  overflowY: 'auto',
};

export const DialogMain = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return <div style={dialogMainStyle} {...props} />;
};

const backIconStyle: React.CSSProperties = {
  fill: 'var(--fuel-color)',
  padding: '7px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

export const BackIcon = ({ size, ...props }: SvgIconProps) => {
  return (
    <CBackIcon
      size={size}
      style={backIconStyle}
      {...props}
      className="fuel-connectors-back-icon"
    />
  );
};

const closeIconStyle: React.CSSProperties = {
  fill: 'var(--fuel-color)',
  padding: '7px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

export const CloseIcon = ({ size, ...props }: SvgIconProps) => {
  return (
    <CCloseIcon
      size={size}
      style={closeIconStyle}
      {...props}
      className="fuel-connectors-close-icon"
    />
  );
};

const placeholderLoaderStyle: React.CSSProperties = {
  animationDuration: '1s',
  animationFillMode: 'forwards',
  animationIterationCount: 'infinite',
  animationName: 'fuelLoader',
  animationTimingFunction: 'linear',
  backgroundColor: '#d1d5d9',
  background: 'var(--fuel-loader-background)',
  backgroundSize: '1000px 104px',
  height: 'fit-content',
  position: 'relative',
  overflow: 'hidden',
  color: 'transparent',
  pointerEvents: 'none',
};

export const PlaceholderLoader = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div style={placeholderLoaderStyle} {...props}>
      {children}
    </div>
  );
};
