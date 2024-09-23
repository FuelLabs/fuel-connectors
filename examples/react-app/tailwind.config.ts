import type { Config } from 'tailwindcss';

// import preset from '@fuels/ui/tailwind-preset';

// const theme = (preset as any).theme as Config['theme'];

// if (!theme) throw new Error('theme is not defined');

export default {
  // presets: [preset],
  content: [
    // './node_modules/@fuels/ui/tailwind.config.ts',
    // './node_modules/@fuels/ui/src/**/*.{js,jsx,ts,tsx}',
    // './node_modules/@fuels/react/tailwind.config.ts',
    // './node_modules/@fuels/react/src/**/*.{js,jsx,ts,tsx}',
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  // theme: {
  //   // ...theme,
  //   fontFamily: {
  //     sans: ['Px Grotesk', 'Segoe UI', 'Roboto', 'sans-serif'],
  //     mono: ['Px Grotesk Mono', 'monospace'],
  //     // ...theme.fontFamily,
  //   },
  //   extend: {
  //     // ...theme.extend,
  //     keyframes: {
  //       // ...theme.keyframes,
  //       hide: {
  //         from: { opacity: '1' },
  //         to: { opacity: '0' },
  //       },
  //       slideIn: {
  //         from: {
  //           transform: 'translateX(calc(100% + var(--viewport-padding)))',
  //         },
  //         to: { transform: 'translateX(0)' },
  //       },
  //       swipeOut: {
  //         from: { transform: 'translateX(var(--radix-toast-swipe-end-x))' },
  //         to: { transform: 'translateX(calc(100% + var(--viewport-padding)))' },
  //       },
  //     },
  //     animation: {
  //       // ...theme.animation,
  //       hide: 'hide 100ms ease-in',
  //       slideIn: 'slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  //       swipeOut: 'swipeOut 100ms ease-out',
  //     },
  //   },
  // },
  plugins: [],
} satisfies Config;

// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     './node_modules/@fuels/ui/tailwind.config.ts',
//     './node_modules/@fuels/ui/src/**/*.{js,jsx,ts,tsx}',
//     './node_modules/@fuels/react/tailwind.config.ts',
//     './node_modules/@fuels/react/src/**/*.{js,jsx,ts,tsx}',
//     './index.html',
//     './src/**/*.{js,jsx,ts,tsx}',
//   ],
//   darkMode: [
//     'selector',
//     // , '[data-theme="dark"]'
//   ],
//   theme: {
//     fontFamily: {
//       sans: ['Px Grotesk', 'Segoe UI', 'Roboto', 'sans-serif'],
//       mono: ['Px Grotesk Mono', 'monospace'],
//     },
//     extend: {
//       keyframes: {
//         hide: {
//           from: { opacity: '1' },
//           to: { opacity: '0' },
//         },
//         slideIn: {
//           from: {
//             transform: 'translateX(calc(100% + var(--viewport-padding)))',
//           },
//           to: { transform: 'translateX(0)' },
//         },
//         swipeOut: {
//           from: { transform: 'translateX(var(--radix-toast-swipe-end-x))' },
//           to: { transform: 'translateX(calc(100% + var(--viewport-padding)))' },
//         },
//       },
//       animation: {
//         hide: 'hide 100ms ease-in',
//         slideIn: 'slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
//         swipeOut: 'swipeOut 100ms ease-out',
//       },
//     },
//   },
//   plugins: [],
// };
