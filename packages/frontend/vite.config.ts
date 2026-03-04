import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@calculating-glory/domain': path.resolve(__dirname, '../domain/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
