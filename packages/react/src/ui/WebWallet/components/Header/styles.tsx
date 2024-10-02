const HeaderWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flexShrink: 0,
};
export const HeaderWrapper = ({ children }: React.PropsWithChildren) => (
  <div style={HeaderWrapperStyle}>{children}</div>
);

const HeaderConnectedStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};
export const HeaderConnected = ({ children }: React.PropsWithChildren) => (
  <div style={HeaderConnectedStyle}>{children}</div>
);

const ConnectorLogoStyle: React.CSSProperties = {
  width: '42px',
  height: '42px',
};
export const ConnectorLogo = ({
  src,
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img src={src} style={ConnectorLogoStyle} aria-label="connector logo" />
);

const HeaderWalletTitleStyle: React.CSSProperties = {
  fontWeight: 600,
};
export const HeaderWalletTitle = ({ children }: React.PropsWithChildren) => (
  <div style={HeaderWalletTitleStyle}>{children}</div>
);

const HeaderWalletAddressWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};
export const HeaderWalletAddressWrapper = ({
  children,
}: React.PropsWithChildren) => (
  <div style={HeaderWalletAddressWrapperStyle}>{children}</div>
);

const HeaderWalletAddressStyle: React.CSSProperties = {
  color: 'var(--fuel-color-muted)',
  fontSize: 'var(--fuel-font-size-sm)',
};
export const HeaderWalletAddress = ({ children }: React.PropsWithChildren) => (
  <div style={HeaderWalletAddressStyle}>{children}</div>
);
