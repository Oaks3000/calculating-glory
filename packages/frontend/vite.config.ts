import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // GitHub Pages serves from /calculating-glory/ — base must match repo name.
  // Locally the dev server serves from /, so this only applies to production builds.
  base: process.env.NODE_ENV === 'production' ? '/calculating-glory/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@calculating-glory/domain': path.resolve(__dirname, '../domain/src/index.ts'),
    },
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: true,
  },
});
