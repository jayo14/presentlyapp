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
              // Group React, Emotion, and Chakra UI together to avoid circular chunk dependencies.
              // These packages are tightly coupled and must be in the same chunk.
              if (
                id.includes('node_modules/react/') ||
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/@emotion/') ||
                id.includes('node_modules/@chakra-ui/') ||
                id.includes('node_modules/@ark-ui/') ||
                id.includes('node_modules/@zag-js/') ||
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
        // Enable minification
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production',
            pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
            passes: 2,
          },
          format: {
            comments: false,
          },
          mangle: {
            safari10: true,
          },
        },
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
          '@chakra-ui/react',
          '@emotion/react',
          '@emotion/styled',
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
