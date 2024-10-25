import {
  type PlaywrightTestConfig,
  defineConfig,
  devices,
} from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

const config: PlaywrightTestConfig = defineConfig({
  testDir: './',
  projects: [
    {
      name: 'react-app',
      testDir: './react-app',
      use: { ...devices['Desktop Chrome'] },
      webServer: {
        command: `pnpm --filter react-app dev --port ${process.env.REACT_APP_PORT}`,
        baseURL: `http://localhost:${process.env.REACT_APP_PORT}`,
        port: Number(process.env.REACT_APP_PORT),
        reuseExistingServer: true,
        timeout: 20000,
      },
    },
    {
      name: 'react-next',
      testDir: './react-next',
      use: { ...devices['Desktop Chrome'] },
      webServer: {
        command: `pnpm --filter @fuel-connectors/react-next-e2e dev --port ${process.env.REACT_NEXT_PORT}`,
        baseURL: `http://localhost:${process.env.REACT_NEXT_PORT}`,
        port: Number(process.env.REACT_NEXT_PORT),
        reuseExistingServer: true,
        timeout: 20000,
      },
    },
  ],
  retries: 1,
  workers: 1,
  timeout: 60_000,
  reporter: [['html', { printSteps: true }]],
  use: {
    permissions: ['clipboard-read', 'clipboard-write'],
    trace: 'on-first-retry',
  },
});

export default config;
