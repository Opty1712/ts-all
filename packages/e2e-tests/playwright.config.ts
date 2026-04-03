import {defineConfig} from '@playwright/test';
import path from 'path';

const PORT = 4173;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.test\.ts/,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run typed-css -w @demo/app && npx vite build --config packages/app/vite.config.ts --mode development && npx vite preview --config packages/app/vite.config.ts --host 127.0.0.1 --port ${PORT}`,
    url: baseURL,
    cwd: path.resolve(__dirname, '../..'),
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
