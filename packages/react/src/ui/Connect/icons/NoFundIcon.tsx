import type { SvgIconProps } from '../../types';

export function NoFundIcon({ size, ...props }: SvgIconProps) {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 95 95"
      width={size}
      height={size}
      {...props}
    >
      <title>No Funds Icon</title>
      <path
        d="M46.88 90.124C30.395 90.124 20 74.39 20 46.679 20 18.97 30.395 3 46.88 3s26.88 15.969 26.88 43.68c0 27.71-10.395 43.444-26.88 43.444Zm0-13.15c8.505 0 13.44-11.038 13.44-30.295 0-6.223-.525-11.624-1.47-16.086L39.005 72.511c2.1 2.936 4.725 4.462 7.875 4.462ZM33.44 46.678c0 6.106.525 11.507 1.47 15.852l19.845-41.918c-2.1-2.936-4.725-4.462-7.875-4.462-8.505 0-13.44 11.154-13.44 30.528Z"
        fill="#EEE"
      />
      <path
        d="M67 91.281c5.523 0 10-4.876 10-10.89C77 74.376 72.523 69.5 67 69.5s-10 4.876-10 10.89c0 6.015 4.477 10.891 10 10.891Z"
        fill="#000"
      />
      <path
        d="M67 91.281c5.523 0 10-4.876 10-10.89C77 74.376 72.523 69.5 67 69.5s-10 4.876-10 10.89c0 6.015 4.477 10.891 10 10.891Z"
        fill="#627EEA"
      />
      <path
        d="M67 91.281c5.523 0 10-4.876 10-10.89C77 74.376 72.523 69.5 67 69.5s-10 4.876-10 10.89c0 6.015 4.477 10.891 10 10.891Z"
        fill="url(#a)"
        style={
          {
            'mix-blend-mode': 'soft-light',
          } as React.CSSProperties
        }
      />
      <path
        d="M67.166 73.13v5.368l4.166 2.027-4.166-7.395Z"
        fill="#fff"
        fill-opacity=".602"
      />
      <path d="M67.166 73.13 63 80.525l4.166-2.027V73.13Z" fill="#fff" />
      <path
        d="M67.166 84.004v3.647l4.17-6.281-4.17 2.634Z"
        fill="#fff"
        fill-opacity=".602"
      />
      <path d="M67.166 87.65v-3.646L63 81.37l4.166 6.28Z" fill="#fff" />
      <path
        d="m67.166 83.16 4.166-2.635-4.166-2.026v4.66Z"
        fill="#fff"
        fill-opacity=".2"
      />
      <path
        d="m63 80.525 4.166 2.634V78.5L63 80.525Z"
        fill="#fff"
        fill-opacity=".602"
      />
      <defs>
        <linearGradient
          id="a"
          x1="67"
          y1="69.5"
          x2="67"
          y2="91.281"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#fff" stop-opacity=".5" />
          <stop offset="1" stop-opacity=".5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
