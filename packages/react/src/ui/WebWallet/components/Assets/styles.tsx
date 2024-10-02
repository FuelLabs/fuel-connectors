const AssetsWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

export const AssetsWrapper = ({ children }: React.PropsWithChildren) => (
  <div style={AssetsWrapperStyle}>{children}</div>
);

const AssetsTitleWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};
export const AssetsTitleWrapper = ({ children }: React.PropsWithChildren) => (
  <div style={AssetsTitleWrapperStyle}>{children}</div>
);

export const AssetsTitle = ({ children }: React.PropsWithChildren) => (
  <h2>{children}</h2>
);

const AssetsCardListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};
export const AssetsCardList = ({ children }: React.PropsWithChildren) => (
  <div style={AssetsCardListStyle}>{children}</div>
);

const AssetCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px',
  borderRadius: '12px',
  backgroundColor: 'var(--fuel-card-background)',
  border: 'var(--fuel-border)',
};
export const AssetCard = ({ children }: React.PropsWithChildren) => (
  <div style={AssetCardStyle}>{children}</div>
);

const AssetCardLeftStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};
export const AssetCardLeft = ({ children }: React.PropsWithChildren) => (
  <div style={AssetCardLeftStyle}>{children}</div>
);

const AssetCardAssetInfoWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};
export const AssetCardAssetInfoWrapper = ({
  children,
}: React.PropsWithChildren) => (
  <div style={AssetCardAssetInfoWrapperStyle}>{children}</div>
);

const AssetCardAssetInfoNameStyle: React.CSSProperties = {
  fontSize: 'var(--fuel-font-size-sm)',
};
export const AssetCardAssetInfoName = ({
  children,
}: React.PropsWithChildren) => (
  <div style={AssetCardAssetInfoNameStyle}>{children}</div>
);

const AssetCardAssetInfoSymbolWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--fuel-color-muted)',
  fontSize: 'var(--fuel-font-size-sm)',
};
export const AssetCardAssetInfoSymbolWrapper = ({
  children,
}: React.PropsWithChildren) => (
  <div style={AssetCardAssetInfoSymbolWrapperStyle}>{children}</div>
);

export const AssetCardAssetInfoSymbol = ({
  children,
}: React.PropsWithChildren) => <div>{children}</div>;

const AssetCardValueStyle: React.CSSProperties = {
  fontSize: 'var(--fuel-font-size-sm)',
};
export const AssetCardValue = ({ children }: React.PropsWithChildren) => (
  <div style={AssetCardValueStyle}>{children}</div>
);

const NoAssetDescriptionStyle: React.CSSProperties = {
  fontWeight: 400,
  color: 'var(--fuel-color-muted)',
  fontSize: 'var(--fuel-font-size-sm)',
  textAlign: 'center',
  lineHeight: '1.2em',
};
export const NoAssetDescription = ({ children }: React.PropsWithChildren) => (
  <p style={NoAssetDescriptionStyle}>{children}</p>
);

const ButtonStyle: React.CSSProperties = {
  display: 'flex',
  boxSizing: 'border-box',
  textDecoration: 'none',
  cursor: 'pointer',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0.4rem 1rem 0',
  padding: '0.6rem 0',
  fontSize: 'var(--fuel-font-size)',
  color: 'var(--fuel-color-bold)',
  borderRadius: 'var(--fuel-border-radius)',
  backgroundColor: 'var(--fuel-button-background)',
};
export const Button = ({
  children,
  href,
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    style={ButtonStyle}
    href={href}
    className="fuel-connectors-connector-button"
  >
    {children}
  </a>
);

const NoAssetButtonStyle: React.CSSProperties = {
  ...ButtonStyle,
  backgroundColor: 'var(--fuel-green-11)',
  color: 'var(--fuel-black-color)',
};
export const NoAssetButton = ({
  children,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    style={NoAssetButtonStyle}
    href={href}
    className="fuel-connectors-connector-button-primary"
    {...props}
  >
    {children}
  </a>
);
