import { Spinner } from '../../../../icons/Spinner';

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
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  borderRadius: 'var(--fuel-border-radius)',
  width: '-webkit-fill-available',
  border: 'none',
  transition: 'all 0.2s ease-in-out',
  minHeight: '44px',
};

export const ConsolidateButtonPrimary = ({
  children,
  isLoading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) => {
  const buttonStyle: React.CSSProperties = {
    ...connectorButtonStyle,
    color: '#ffffff',
    ...(props.disabled || isLoading
      ? {
          backgroundColor: '#9ca3af',
          cursor: 'not-allowed',
        }
      : {
          backgroundColor: '#2563eb',
        }),
  };

  return (
    <button
      style={buttonStyle}
      {...props}
      disabled={!!isLoading || props.disabled}
      className="fuel-connectors-connector-button-primary"
    >
      {isLoading ? <Spinner size={16} color="#ffffff" /> : children}
    </button>
  );
};
