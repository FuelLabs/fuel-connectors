import type { SvgIconProps } from '../types';

export function CloseIcon({ size, ...props }: SvgIconProps) {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      {...props}
    >
      <title>Close Icon</title>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2.54 2.54a1 1 0 0 1 1.42 0L8 6.6l4.04-4.05a1 1 0 1 1 1.42 1.42L9.4 8l4.05 4.04a1 1 0 0 1-1.42 1.42L8 9.4l-4.04 4.05a1 1 0 0 1-1.42-1.42L6.6 8 2.54 3.96a1 1 0 0 1 0-1.42Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
