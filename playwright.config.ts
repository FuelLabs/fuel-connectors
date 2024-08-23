import {
  type PlaywrightTestConfig,
  defineConfig,
  devices,
} from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

const config: PlaywrightTestConfig = defineConfig({
  testDir: './e2e-tests',
  projects: [
    {
      name: 'react-app',
      testDir: './e2e-tests/react-app',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  retries: 1,
  workers: 1,
  timeout: 60_000,
  reporter: [['html', { printSteps: true }]],
  webServer: {
    command: `pnpm --filter react-app dev --port ${process.env.PORT}`,
    port: Number(process.env.PORT),
    reuseExistingServer: true,
    timeout: 20000,
  },
  use: {
    baseURL: `http://localhost:${process.env.PORT}`,
    permissions: ['clipboard-read', 'clipboard-write'],
    trace: 'on-first-retry',
  },
});

export default config;
