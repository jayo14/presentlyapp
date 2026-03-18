import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tsconfigPaths()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          'react': path.resolve(__dirname, './node_modules/react'),
          'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
          'react/jsx-runtime': path.resolve(__dirname, './node_modules/react/jsx-runtime'),
          'react/jsx-dev-runtime': path.resolve(__dirname, './node_modules/react/jsx-dev-runtime'),
        },
        dedupe: ['react', 'react-dom'],
      },
      build: {
        // Enable code splitting with careful control over chunks
        rollupOptions: {
          output: {
            manualChunks(id) {
              // Group React and animation libs together to avoid circular chunk dependencies.
              if (
                id.includes('node_modules/react/') ||
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/framer-motion/')
              ) {
                return 'vendor-react';
              }
              if (id.includes('node_modules/maplibre-gl')) {
                return 'maplibre';
              }
              if (id.includes('node_modules/@mapbox/')) {
                return 'mapbox-draw';
              }
              if (id.includes('node_modules/react-router')) {
                return 'react-router';
              }
              if (id.includes('node_modules/@tanstack/')) {
                return 'query-core';
              }
            },
          },
        },
        // Optimize chunk size
        chunkSizeWarningLimit: 1500,
        // Use esbuild minifier — safe for maplibre-gl and mapbox-gl-draw.
        // Terser with passes:2 + safari10 mangle was corrupting internal variable
        // references inside these map libraries, causing "ReferenceError: e is not defined".
        minify: 'esbuild',
        // Source maps for debugging (disable in production for performance)
        sourcemap: mode !== 'production',
        // Target modern browsers for smaller bundle size
        target: 'es2022',
        // Enable CSS code splitting and minification
        cssCodeSplit: true,
        cssMinify: true,
        // Reduce inline asset size limit for better caching
        assetsInlineLimit: 2048,
        // Disable size reporting for faster builds
        reportCompressedSize: false,
      },
      // Performance optimizations
      optimizeDeps: {
        include: [
          'react', 
          'react-dom', 
          'react-router-dom',
          'react-router',
          '@tanstack/react-query',
          'axios',
          'lucide-react',
          'maplibre-gl',
          '@mapbox/mapbox-gl-draw',
          'react-icons',
          'framer-motion',
          'next-themes',
          'react-helmet-async',
        ],
        exclude: ['@google/genai'],
        esbuildOptions: {
          target: 'es2022',
          define: {
            global: 'globalThis',
          },
        }
      },
      // Additional esbuild options
      esbuild: {
        // Handle class fields properly - use es2022 for native class field support
        target: 'es2022',
        keepNames: true,
      },
    };
});
