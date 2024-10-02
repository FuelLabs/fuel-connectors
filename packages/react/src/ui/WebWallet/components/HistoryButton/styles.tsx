const ButtonStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  gap: '4px',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  height: '32px',
  cursor: 'pointer',
  borderRadius: '16px',
};
export const Button = ({
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    style={ButtonStyle}
    className="fuel-connectors-wallet-button-primary"
    {...props}
  >
    {children}
  </a>
);
