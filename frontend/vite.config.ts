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
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_MAPBOX_TOKEN': JSON.stringify(env.VITE_MAPBOX_TOKEN)
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
            manualChunks: {
              // Vendor chunks for better caching
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'query-vendor': ['@tanstack/react-query'],
              'ui-vendor': ['framer-motion', 'lucide-react'],
              'map-vendor': ['mapbox-gl', 'maplibre-gl', 'react-map-gl'],
              'chart-vendor': ['recharts'],
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
          },
        },
        // Source maps for debugging (disable in production for performance)
        sourcemap: mode !== 'production',
      },
      // Performance optimizations
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
      },
    };
});
