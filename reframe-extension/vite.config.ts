import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    crx({ manifest: manifest as any })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'framer-motion': ['framer-motion'],
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/shared')
    }
  }
});
