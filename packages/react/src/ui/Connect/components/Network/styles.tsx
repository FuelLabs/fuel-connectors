const defaultVerticalMargin = '0.8em';

const dialogMainStyle: React.CSSProperties = {
  position: 'relative',
  padding: 'calc(0.8em + 4px) 16px 0.8em 16px',
};

export const DialogMain = ({ children }: React.PropsWithChildren) => {
  return <div style={dialogMainStyle}>{children}</div>;
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--fuel-items-gap)',
};

export const Container = ({ children }: React.PropsWithChildren) => {
  return <div style={containerStyle}>{children}</div>;
};

const titleStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '1.2em',
  fontWeight: 500,
  color: 'var(--fuel-color-bold)',
  lineHeight: 1,
};

export const Title = ({ children }: React.PropsWithChildren) => {
  return <h2 style={titleStyle}>{children}</h2>;
};

const dividerStyle: React.CSSProperties = {
  height: '1px',
  width: '100%',
  backgroundColor: 'var(--fuel-separator-color)',
  margin: '10px 0',
  boxSizing: 'border-box',
};

export const Divider = () => {
  return <div style={dividerStyle} />;
};

const headerStyle: React.CSSProperties = {
  margin: '20px 20px 0 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: defaultVerticalMargin,
  marginBottom: defaultVerticalMargin,
};

export const Header = ({ children }: React.PropsWithChildren) => {
  return <div style={headerStyle}>{children}</div>;
};

const descriptionStyle: React.CSSProperties = {
  fontWeight: 400,
  textAlign: 'center',
  lineHeight: '1.2em',
  color: 'var(--fuel-color-light-gray)',
  marginBottom: '10px',
  marginTop: '10px',
};

export const Description = ({ children }: React.PropsWithChildren) => {
  return <p style={descriptionStyle}>{children}</p>;
};

const errorMessageStyle: React.CSSProperties = {
  fontWeight: 400,
  textAlign: 'center',
  lineHeight: '1.2em',
  opacity: 0.8,
  color: 'var(--fuel-color-error)',
};

export const ErrorMessage = ({ children }: React.PropsWithChildren) => {
  return <div style={errorMessageStyle}>{children}</div>;
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  height: '40px',
  display: 'flex',
  borderRadius: '11px',
  textDecoration: 'none',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0.4rem 0',
  fontSize: '0.875em',
  marginBottom: 0,
  color: 'var(--fuel-black-color)',
};

export const Button = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      style={buttonStyle}
      {...props}
      className="fuel-connectors-button-base fuel-connectors-button"
    />
  );
};

const buttonDisconnectStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: 'var(--fuel-button-background)',
  color: 'var(--fuel-color-bold)',
};

export const ButtonDisconnect = (
  props: React.InputHTMLAttributes<HTMLInputElement>,
) => {
  return (
    <input
      style={buttonDisconnectStyle}
      {...props}
      className="fuel-connectors-button-base fuel-connectors-button-disconnect"
    />
  );
};

const orLabelStyle: React.CSSProperties = {
  fontWeight: 400,
  textAlign: 'center',
  lineHeight: 1,
  color: 'var(--fuel-color-light-gray)',
};

export const OrLabel = ({ children }: React.PropsWithChildren) => {
  return <div style={orLabelStyle}>{children}</div>;
};

const buttonLoadingStyle: React.CSSProperties = {
  ...buttonStyle,
  marginBottom: 0,
};

export const ButtonLoading = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      style={buttonLoadingStyle}
      {...props}
      className="fuel-connectors-button-base"
    >
      {children}
    </div>
  );
};
