import type { SvgIconProps } from '../types';

export function ErrorIcon({ size = 24, theme = 'light' }: SvgIconProps) {
  const color = theme === 'light' ? '#f25a68' : '#ff6b7a';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Error Icon"
      role="img"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 17V15H13V17H11ZM11 7V13H13V7H11Z"
        fill={color}
      />
    </svg>
  );
}
