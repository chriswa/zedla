/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'

export default defineConfig({
  // Inherit plugins from vite config
  plugins: [swc.vite()],

  // Inherit resolve configuration for path aliases
  resolve: {
    alias: {
      '@': '/src',
    },
  },

  test: {
    // Use Node environment (no DOM simulation)
    environment: 'node',

    // Setup file for reflect-metadata and other test initialization
    setupFiles: ['src/test/setup.ts'],

    // Test file patterns
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // Global test APIs (describe, it, expect, etc.)
    globals: true,
  },
})