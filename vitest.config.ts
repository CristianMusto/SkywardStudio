import { defineConfig } from 'vitest/config';

/** Unit tests for the engine modules (no Angular TestBed needed). Run with `npm test`. */
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
});
