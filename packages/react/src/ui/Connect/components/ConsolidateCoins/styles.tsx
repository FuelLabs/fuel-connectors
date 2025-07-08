const dialogContainer: React.CSSProperties = {
  margin: '0 1rem',
  padding: '0.5rem',
};

export const DialogContainer = ({
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLDivElement>) => {
  return (
    <div style={dialogContainer} {...props}>
      {children}
    </div>
  );
};

const connectorButtonStyle: React.CSSProperties = {
  display: 'flex',
  boxSizing: 'border-box',
  textDecoration: 'none',
  cursor: 'pointer',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0.4rem 1rem 0',
  padding: '0.6rem 0',
  fontSize: '0.875em',
  borderRadius: 'var(--fuel-border-radius)',
  width: '-webkit-fill-available',
};

export const ConsolidateButtonPrimary = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      style={connectorButtonStyle}
      {...props}
      className="fuel-connectors-connector-button-primary"
    >
      {children}
    </button>
  );
};
