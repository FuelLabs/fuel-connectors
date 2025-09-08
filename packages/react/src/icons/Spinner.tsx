interface SpinnerProps {
  size: number;
  color: string;
}

export const Spinner = ({ size, color }: SpinnerProps) => {
  const spinnerStyle: React.CSSProperties = {
    height: `${size}px`,
    width: `${size}px`,
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'fuelSpin 1s infinite linear',
  };

  return <div style={spinnerStyle} />;
};
