import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Enable code splitting
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Vendor chunks for better caching
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                  return 'react-vendor';
                }
                if (id.includes('@tanstack/react-query')) {
                  return 'query-vendor';
                }
                if (id.includes('framer-motion') || id.includes('lucide-react')) {
                  return 'ui-vendor';
                }
                if (id.includes('maplibre-gl') || id.includes('react-map-gl')) {
                  return 'map-vendor';
                }
                if (id.includes('recharts')) {
                  return 'chart-vendor';
                }
                if (id.includes('axios') || id.includes('sonner')) {
                  return 'utils-vendor';
                }
                // Other node_modules go into a general vendor chunk
                return 'vendor';
              }
            },
          },
        },
        // Optimize chunk size
        chunkSizeWarningLimit: 1000,
        // Enable minification
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production',
            pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
          },
          mangle: {
            safari10: true,
          },
        },
        // Source maps for debugging (disable in production for performance)
        sourcemap: mode !== 'production',
        // Target modern browsers for smaller bundle size
        target: 'es2015',
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Reduce inline asset size limit for better caching
        assetsInlineLimit: 4096,
      },
      // Performance optimizations
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
        exclude: ['@google/genai'],
      },
    };
});
