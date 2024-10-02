const AvatarStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
};
export const Avatar = ({
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    style={AvatarStyle}
    {...props}
    aria-label={props['aria-label'] ?? 'avatar'}
  />
);

const AvatarFallbackStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '100%',
};
export const AvatarFallback = ({
  children,
  background,
}: React.PropsWithChildren<{ background?: string }>) => (
  <div
    style={{
      ...AvatarFallbackStyle,
      background: background,
    }}
  >
    {children}
  </div>
);
