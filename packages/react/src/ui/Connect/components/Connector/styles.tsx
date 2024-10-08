export const connectorTitleStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '1.2em',
  fontWeight: 500,
  color: 'var(--fuel-color-bold)',
  margin: '0 0 0.4em 0',
  padding: '0 1.8em',
};

export const ConnectorTitle = ({ children }: React.PropsWithChildren) => {
  return <h2 style={connectorTitleStyle}>{children}</h2>;
};

export const connectorDescriptionStyle: React.CSSProperties = {
  color: 'var(--fuel-gray-12)',
  fontSize: '0.9em',
  fontWeight: 400,
  textAlign: 'center',
  margin: '0 1.2em',
  lineHeight: '1.2em',
  padding: '0 2em',
  opacity: 0.8,
};

export const ConnectorDescription = ({ children }: React.PropsWithChildren) => {
  return <p style={connectorDescriptionStyle}>{children}</p>;
};

const connectorFooterHelperStyle: React.CSSProperties = {
  color: 'var(--fuel-gray-12)',
  fontSize: '0.8em',
  fontWeight: 400,
  textAlign: 'center',
  margin: '2em auto 0',
  lineHeight: '1.2em',
  padding: '0 2em',
  opacity: 0.5,
};

export const ConnectorFooterHelper = ({
  children,
}: React.PropsWithChildren) => {
  return <p style={connectorFooterHelperStyle}>{children}</p>;
};

const connectorDescriptionErrorStyle: React.CSSProperties = {
  ...connectorDescriptionStyle,
  color: 'var(--fuel-color-error)',
};

export const ConnectorDescriptionError = ({
  children,
}: React.PropsWithChildren) => {
  return <p style={connectorDescriptionErrorStyle}>{children}</p>;
};

const connectorImageStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  height: '6.2em',
  width: '100%',
  marginTop: '1.6em',
  marginBottom: '1.2em',
};

export const ConnectorImage = ({ children }: React.PropsWithChildren) => {
  return <div style={connectorImageStyle}>{children}</div>;
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
};

export const ConnectorButton = ({
  href,
  children,
  style,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <a
      href={href}
      style={connectorButtonStyle}
      {...props}
      className="fuel-connectors-connector-button"
    >
      {children}
    </a>
  );
};

export const connectorContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginBottom: '24px',
};

export const ConnectorContent = ({ children }: React.PropsWithChildren) => {
  return <div style={connectorContentStyle}>{children}</div>;
};

export const ConnectorButtonPrimary = ({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <a
      href={href}
      style={connectorButtonStyle}
      {...props}
      className="fuel-connectors-connector-button-primary"
    >
      {children}
    </a>
  );
};
