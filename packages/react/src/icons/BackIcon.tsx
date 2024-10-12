import type { SvgIconProps } from '../types';

export function BackIcon({ size, ...props }: SvgIconProps) {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      {...props}
    >
      <title>Back Icon</title>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M11.04 1.46a1 1 0 0 1 0 1.41L5.91 8l5.13 5.13a1 1 0 1 1-1.41 1.41L3.79 8.71a1 1 0 0 1 0-1.42l5.84-5.83a1 1 0 0 1 1.41 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
