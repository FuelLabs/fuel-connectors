const FooterWrapperStyle: React.CSSProperties = {
  marginTop: '-4px',
};
export const FooterWrapper = ({ children }: React.PropsWithChildren) => (
  <div style={FooterWrapperStyle}>{children}</div>
);

const FooterContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  gap: '4px',
  fontSize: 'smaller',
};
export const FooterContent = ({ children }: React.PropsWithChildren) => (
  <div style={FooterContentStyle}>{children}</div>
);
