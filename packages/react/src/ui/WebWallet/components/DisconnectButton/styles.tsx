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
  onClick,
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    style={ButtonStyle}
    type="button"
    onClick={onClick}
    className="fuel-connectors-wallet-button-danger"
  >
    {children}
  </button>
);
