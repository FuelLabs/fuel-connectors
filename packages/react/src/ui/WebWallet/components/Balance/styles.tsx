const BalanceWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};
export const BalanceWrapper = ({ children }: React.PropsWithChildren) => (
  <div style={BalanceWrapperStyle}>{children}</div>
);

const BalanceTitleStyle: React.CSSProperties = {
  color: 'var(--fuel-color-muted)',
  fontSize: 'var(--fuel-font-size-sm)',
};
export const BalanceTitle = ({ children }: React.PropsWithChildren) => (
  <div style={BalanceTitleStyle}>{children}</div>
);

const BalanceValueRowStyle: React.CSSProperties = {
  fontSize: 'var(--fuel-font-size-lg)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  letterSpacing: 'var(--fuel-letter-spacing-lg)',
};
export const BalanceValueRow = ({ children }: React.PropsWithChildren) => (
  <div style={BalanceValueRowStyle}>{children}</div>
);

const BalanceValueStyle: React.CSSProperties = {
  color: 'var(--fuel-color)',
};
export const BalanceValue = ({ children }: React.PropsWithChildren) => (
  <div style={BalanceValueStyle}>{children}</div>
);
