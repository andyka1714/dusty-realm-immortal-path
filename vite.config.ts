import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pixi.js')) {
            return 'pixi';
          }

          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('react-redux') ||
            id.includes('@reduxjs/toolkit')
          ) {
            return 'framework';
          }

          if (id.includes('lucide-react')) {
            return 'icons';
          }

          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
