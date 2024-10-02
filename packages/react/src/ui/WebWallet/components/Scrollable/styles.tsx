const ScrollableWrapperStyle: React.CSSProperties = {
  overflowY: 'auto',
  maxHeight: '100%',
  flex: 1,
  scrollBehavior: 'smooth',
};
export const ScrollableWrapper = ({ children }: React.PropsWithChildren) => (
  <div
    style={ScrollableWrapperStyle}
    className="fuel-connectors-wallet-scrollable"
  >
    {children}
  </div>
);

const ScrollableContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};
export const ScrollableContent = ({ children }: React.PropsWithChildren) => (
  <div style={ScrollableContentStyle}>{children}</div>
);
