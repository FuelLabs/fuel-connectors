import { connectorContentStyle } from '../Connector/styles';

export const disclaimerContainerStyle: React.CSSProperties = {
  ...connectorContentStyle,
  gap: '12px',
  borderLeft: '2px solid',
  borderColor: '#F5CC00',
  marginLeft: '1rem',
  padding: '0.5em 2em',
  fontSize: '1em',
};

export const DisclaimerContainer = ({ children }: React.PropsWithChildren) => {
  return <div style={disclaimerContainerStyle}>{children}</div>;
};

const disclaimerListStyle: React.CSSProperties = {
  fontWeight: 400,
  textAlign: 'left',
  margin: 0,
  paddingInlineStart: '16px',
  lineHeight: '1.4em',
  opacity: 0.8,
  listStyleType: 'disc',
};

export const DisclaimerList = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) => {
  return (
    <ul
      style={disclaimerListStyle}
      {...props}
      className="fuel-connectors-disclaimer-list"
    >
      {children}
    </ul>
  );
};
