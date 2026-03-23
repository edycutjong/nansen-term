import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'json'],
      exclude: ['node_modules/', 'dist/', 'vitest.config.ts'],
    },
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
