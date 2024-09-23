// @ts-ignore
import preset from '@fuels/ui/tailwind-preset';
import type { Config } from 'tailwindcss';

console.log('asd - auisdhaisudasdiuhdsaiu');

export default {
  darkMode: 'selector',
  presets: [preset],
  content: [
    './node_modules/@fuels/ui/tailwind.config.ts',
    './node_modules/@fuels/ui/src/**/*.{js,jsx,ts,tsx}',
    './tailwind.config.ts',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
} satisfies Config;
