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
            manualChunks: {
              'vendor-core': ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'sonner', 'class-variance-authority', 'tailwind-merge', 'clsx'],
              'vendor-query': ['@tanstack/react-query'],
              'vendor-map': ['maplibre-gl'],
              'vendor-charts': ['recharts'],
              'chunk-admin': ['./components/Dashboard/AdminDashboard'],
              'chunk-auth': ['./components/Auth/Login', './components/Auth/Register', './components/Auth/Onboarding']
            }
          },
        },
        // Optimize chunk size
        chunkSizeWarningLimit: 600,
        // Terser with specific configurations
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
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
          // Avoid emitting __name helper wrappers in prebundled deps.
          keepNames: false,
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
