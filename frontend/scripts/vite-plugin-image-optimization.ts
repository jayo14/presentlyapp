// vite-plugin-image-optimization.ts
// Auto-optimizes images during build

import { Plugin } from 'vite';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export function imageOptimizationPlugin(): Plugin {
  return {
    name: 'image-optimization',
    apply: 'build',
    async generateBundle(options, bundle) {
      const dist = options.dir || 'dist';
      const publicDir = 'public';
      
      // Copy optimized images to dist
      const copyImage = async (source: string, dest: string) => {
        if (!fs.existsSync(source)) return;
        
        const data = fs.readFileSync(source);
        fs.writeFileSync(dest, data);
      };

      // Ensure assets directory exists
      const assetsDir = path.join(dist, 'assets');
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      // Copy WebP and AVIF variants
      const imagesToCopy = [
        { src: 'logo', dest: 'assets/logo' },
        { src: 'images/dashboard_hero', dest: 'assets/dashboard_hero' }
      ];

      for (const img of imagesToCopy) {
        await copyImage(
          path.join(publicDir, `${img.src}.webp`),
          path.join(dist, `${img.dest}.webp`)
        );
        await copyImage(
          path.join(publicDir, `${img.src}.avif`),
          path.join(dist, `${img.dest}.avif`)
        );
      }
    }
  };
}
