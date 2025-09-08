export const connectorItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box',
  cursor: 'pointer',
  width: '100%',
  gap: 'var(--fuel-items-gap)',
  padding: '0.8em',
  borderRadius: '16px',
  fontWeight: 400,
  transition: 'all 0.2s ease-in-out',
};

export const ConnectorItem = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      style={connectorItemStyle}
      {...props}
      className="fuel-connectors-connector-item"
    >
      {children}
    </div>
  );
};

const connectorListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--fuel-items-gap)',
  padding: '0px 14px',
};

export const ConnectorList = ({ children }: React.PropsWithChildren) => {
  return <div style={connectorListStyle}>{children}</div>;
};

const connectorNameStyle: React.CSSProperties = {
  fontSize: '0.875em',
};

export const ConnectorName = ({ children }: React.PropsWithChildren) => {
  return <div style={connectorNameStyle}>{children}</div>;
};

const connectorImgStyle: React.CSSProperties = {
  objectFit: 'cover',
};

export const ConnectorImg = (
  props: React.ImgHTMLAttributes<HTMLImageElement>,
) => {
  return <img {...props} alt={props.alt} style={connectorImgStyle} />;
};

const badgeStyle: React.CSSProperties = {
  borderRadius: 'var(--fuel-border-radius)',
  fontSize: 'var(--fuel-font-size-xs)',
  padding: '2px 8px',
  textTransform: 'uppercase',
  marginLeft: 'auto',
};

export const BadgeInfo = ({ children }: React.PropsWithChildren) => {
  const style: React.CSSProperties = {
    ...badgeStyle,
    backgroundColor: 'var(--fuel-blue-3)',
    color: 'var(--fuel-blue-11)',
  };

  return <div style={style}>{children}</div>;
};

export const BadgeSuccess = ({ children }: React.PropsWithChildren) => {
  const style: React.CSSProperties = {
    ...badgeStyle,
    backgroundColor: 'var(--fuel-green-3)',
    color: 'var(--fuel-green-11)',
  };

  return <div style={style}>{children}</div>;
};

const groupTitleStyle: React.CSSProperties = {
  width: '100%',
  color: '#797979',
  fontSize: 'var(--fuel-font-size-xs)',
  fontStyle: 'normal',
  fontWeight: 400,
  margin: 0,
};

export const GroupTitle = ({ children }: React.PropsWithChildren) => {
  return <p style={groupTitleStyle}>{children}</p>;
};

export const GroupLastTitle = ({ children }: React.PropsWithChildren) => {
  const style: React.CSSProperties = {
    ...groupTitleStyle,
    marginTop: '14px',
  };

  return <p style={style}>{children}</p>;
};
