// @ts-ignore
import preset from '@fuels/ui/tailwind-preset';
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'selector',
  presets: [preset],
  content: ['./src/**/*.{js,jsx,ts,tsx}', '@fuels/ui/index.esm.js'],
} satisfies Config;
