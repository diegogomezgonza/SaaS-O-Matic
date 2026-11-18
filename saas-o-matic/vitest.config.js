import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'backend',
          environment: 'node',
          include: ['tests/*.test.js'],
          setupFiles: ['tests/setup.js'],
          restoreMocks: true,
        },
      },
      {
        extends: true,
        test: {
          name: 'frontend',
          environment: 'jsdom',
          include: ['tests/ui/**/*.test.{js,jsx}'],
          setupFiles: ['tests/setup.js'],
          restoreMocks: true,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reportOnFailure: true,
      include: ['server/**/*.js', 'shared/**/*.js', 'src/**/*.{js,jsx}'],
      exclude: ['server/index.js', 'src/main.jsx'],
      reporter: ['text', 'json', 'json-summary', ['html', { subdir: 'details' }]],
      reportsDirectory: 'coverage-report',
      thresholds: { perFile: true, lines: 100, statements: 100, functions: 100, branches: 100 },
    },
  },
});
