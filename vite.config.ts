import path from 'path';
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'fs';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const copyRuntimeAssets = () => ({
  name: 'copy-runtime-assets',
  apply: 'build' as const,
  closeBundle() {
    const targetRoot = path.resolve(__dirname, 'dist/assets/generated');
    rmSync(targetRoot, { recursive: true, force: true });
    const sourceRoot = path.resolve(__dirname, 'public/assets/generated');
    const copyFrames = (directory: string, relativeDirectory: string) => {
      if (!existsSync(directory)) return;
      for (const entry of readdirSync(directory)) {
        const sourcePath = path.join(directory, entry);
        const sourceStats = statSync(sourcePath);
        if (sourceStats.isDirectory()) {
          copyFrames(sourcePath, path.join(relativeDirectory, entry));
          continue;
        }
        if (!relativeDirectory.split(path.sep).includes('frames') || !entry.endsWith('.png')) {
          continue;
        }
        const targetDirectory = path.resolve(__dirname, 'dist/assets/generated', relativeDirectory);
        mkdirSync(targetDirectory, { recursive: true });
        copyFileSync(sourcePath, path.join(targetDirectory, entry));
      }
    };

    copyFrames(path.join(sourceRoot, 'characters'), 'characters');

    const fallback = path.join(sourceRoot, 'ui/fallback/transparent.png');
    if (existsSync(fallback)) {
      const fallbackDirectory = path.resolve(__dirname, 'dist/assets/generated/ui/fallback');
      mkdirSync(fallbackDirectory, { recursive: true });
      copyFileSync(fallback, path.join(fallbackDirectory, 'transparent.png'));
    }
  },
});

export default defineConfig({
  publicDir: 'public',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), copyRuntimeAssets()],
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
  },
  build: {
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pixi.js-legacy')) {
            return 'pixi-preview';
          }

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
