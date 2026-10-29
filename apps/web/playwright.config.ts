import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5193', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } },
    },
  ],
  webServer: {
    env: { VITE_GOOGLE_CLIENT_ID: 'viratec-ui-test.apps.googleusercontent.com' },
    command: 'pnpm dev --port 5193 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:5193/tests/fixtures/ui-kit.html',
    reuseExistingServer: false,
  },
});
