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
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${process.env.REACT_APP_PORT}`,
      },
    },
    {
      name: 'react-next',
      testDir: './react-next',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${process.env.REACT_NEXT_PORT}`,
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
