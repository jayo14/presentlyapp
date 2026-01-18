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
              if (id.includes('node_modules')) {
                // Core React dependencies - keep these together and load first
                if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) {
                  return 'vendor-react';
                }
                
                // Specific large libraries
                if (id.includes('@tanstack/react-query')) {
                  return 'vendor-query';
                }
                if (id.includes('lucide-react') || id.includes('framer-motion')) {
                  return 'vendor-ui';
                }
                if (id.includes('mapbox-gl') || id.includes('maplibre-gl') || id.includes('react-map-gl')) {
                  return 'vendor-maps';
                }
                // if (id.includes('recharts') || id.includes('d3') || id.includes('react-smooth')) {
                //   return 'vendor-charts';
                // }
                if (id.includes('firebase')) {
                  return 'vendor-firebase';
                }
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
        target: 'es2020',
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
        include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
        exclude: ['@google/genai'],
      },
    };
});
