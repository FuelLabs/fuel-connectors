export interface ICopyProps {
  width?: string;
  height?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
}

export const CopyIcon = ({ width, height, onClick }: ICopyProps) => {
  const w = width ?? '24';
  const h = height ?? '24';
  const style = {
    fill: 'currentColor',
    cursor: 'pointer',
  };
  return (
    // biome-ignore lint: no need for keyUp here
    <svg
      style={style}
      onClick={onClick}
      width={w}
      height={h}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Copy</title>
      <path d="M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z" />
    </svg>
  );
};
