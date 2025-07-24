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
      name: 'Examples - React',
      testDir: './examples',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${process.env.REACT_APP_PORT}`,
      },
    },
    {
      name: 'Examples - Next.js',
      testDir: './examples',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${process.env.REACT_NEXT_PORT}`,
      },
    },
  ],
  retries: 0,
  maxFailures: 1,
  workers: 1,
  timeout: 100_000,
  reporter: [['html', { printSteps: true }]],
  use: {
    permissions: ['clipboard-read', 'clipboard-write'],
    trace: 'on-first-retry',
  },
});

export default config;
