import type { SvgIconProps } from '../types';

export function InfoCircleIcon({
  theme,
  size,
  stroke = '#797979',
  ...props
}: SvgIconProps & { stroke?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Info Circle Icon</title>
      <g clip-path="url(#clip0_2341_25997)">
        <path
          d="M5.375 5.5H6L6 8.125M10.625 6C10.625 8.55432 8.55432 10.625 6 10.625C3.44568 10.625 1.375 8.55432 1.375 6C1.375 3.44568 3.44568 1.375 6 1.375C8.55432 1.375 10.625 3.44568 10.625 6Z"
          stroke={stroke}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <rect
          x="5.625"
          y="3.625"
          width="0.75"
          height="0.75"
          rx="0.375"
          fill={stroke}
          stroke={stroke}
          stroke-width="0.25"
        />
      </g>
      <defs>
        <clipPath id="clip0_2341_25997">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
