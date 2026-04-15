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
        // Enable code splitting with aggressive dynamic chunking
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // PHASE 1: Lazy-load maplibre-gl (1GB+) - only used in admin VenueMap
              if (id.includes('maplibre-gl') || id.includes('@maplibre/')) {
                return 'vendor-map-lazy';
              }
              
              // PHASE 1: Lazy-load recharts (385KB) - only used in dashboards
              if (id.includes('recharts')) {
                return 'vendor-charts-lazy';
              }
              
              // PHASE 2: Separate markdown bundle - used only on blog pages
              if (id.includes('react-markdown') || 
                  id.includes('remark-gfm') || 
                  id.includes('rehype-slug') || 
                  id.includes('rehype-highlight') ||
                  id.includes('mdast-util-') ||
                  id.includes('unified') ||
                  id.includes('micromark')) {
                return 'vendor-markdown';
              }
              
              // Core vendor - always needed
              if (id.includes('node_modules/react') && 
                  !id.includes('react-markdown') && 
                  !id.includes('react-leaflet')) {
                return 'vendor-core';
              }
              if (id.includes('node_modules/react-dom')) {
                return 'vendor-core';
              }
              if (id.includes('react-router-dom') || id.includes('react-router/')) {
                return 'vendor-core';
              }
              if (id.includes('lucide-react') || 
                  id.includes('sonner') || 
                  id.includes('class-variance-authority') || 
                  id.includes('tailwind-merge') || 
                  id.includes('clsx')) {
                return 'vendor-core';
              }
              
              // Query management
              if (id.includes('@tanstack/react-query')) {
                return 'vendor-query';
              }
              
              // Motion library
              if (id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              
              // Admin dashboard - admin only
              if (id.includes('components/Dashboard/AdminDashboard')) {
                return 'chunk-admin';
              }
              
              // Auth routes - loaded on demand
              if (id.includes('components/Auth')) {
                return 'chunk-auth';
              }
              
              // Leaflet/map libraries - lazy load
              if (id.includes('leaflet') || id.includes('react-leaflet')) {
                return 'vendor-leaflet-lazy';
              }
            }
          },
        },
        // Aggressive chunk size limits
        chunkSizeWarningLimit: 300,
        // Terser with aggressive settings
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            passes: 3,
            ecma: 2022,
          },
          mangle: true,
          format: {
            comments: false,
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
          'framer-motion',
          'next-themes',
          'react-helmet-async',
          'recharts',
          'es-toolkit',
          '@google/genai',
          'p-retry',
          '@mapbox/mapbox-gl-draw',
          '@mapbox/geojson-area',
          '@mapbox/point-geometry',
          '@mapbox/unitbezier',
        ],
        exclude: ['maplibre-gl', 'firebase'],
        esbuildOptions: {
          target: 'es2022',
          define: {
            global: 'globalThis',
          },
          // Avoid emitting __name helper wrappers in prebundled deps.
          keepNames: true,
        }
      },
      // Additional esbuild options
      esbuild: {
        // Handle class fields properly - use es2022 for native class field support
        target: 'es2022',
        // keepNames can emit __name helpers that break in some optimized map chunks.
        keepNames: false,
      },
    };
});
