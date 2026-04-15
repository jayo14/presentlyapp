#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts PNG/JPG to WebP/AVIF for better performance
 * Usage: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public');
const imageDir = path.join(publicDir, 'images');

// Ensure images directory exists
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

const imagesToOptimize = [
  { input: path.join(publicDir, 'logo.png'), name: 'logo' },
  { input: path.join(imageDir, 'dashboard_hero.png'), name: 'dashboard_hero' },
  { input: path.join(publicDir, '3d-logo.png'), name: '3d-logo' },
];

async function optimizeImage(inputPath, outputName) {
  if (!fs.existsSync(inputPath)) {
    console.log(`⏭️  Skipping ${outputName} - file not found`);
    return;
  }

  const outputDir = path.dirname(inputPath);
  const originalSize = fs.statSync(inputPath).size;

  try {
    // WebP conversion (primary modern format)
    const webpPath = path.join(outputDir, `${outputName}.webp`);
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(webpPath);
    const webpSize = fs.statSync(webpPath).size;
    const webpSavings = ((1 - webpSize / originalSize) * 100).toFixed(1);

    // AVIF conversion (future format, smaller)
    const avifPath = path.join(outputDir, `${outputName}.avif`);
    await sharp(inputPath)
      .avif({ quality: 75 })
      .toFile(avifPath);
    const avifSize = fs.statSync(avifPath).size;
    const avifSavings = ((1 - avifSize / originalSize) * 100).toFixed(1);

    console.log(`✅ ${outputName}`);
    console.log(`   Original:  ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`   WebP:      ${(webpSize / 1024).toFixed(1)} KB (${webpSavings}% smaller)`);
    console.log(`   AVIF:      ${(avifSize / 1024).toFixed(1)} KB (${avifSavings}% smaller)`);
    console.log('');

  } catch (err) {
    console.error(`❌ Failed to optimize ${outputName}:`, err.message);
  }
}

async function main() {
  console.log('🖼️  Image Optimization Starting...\n');
  
  for (const image of imagesToOptimize) {
    await optimizeImage(image.input, image.name);
  }

  console.log('✨ Image optimization complete!');
  console.log('\nNext steps:');
  console.log('1. Update image references to use .webp');
  console.log('2. Add <picture> elements for format fallback');
  console.log('3. Add loading="lazy" to images');
  console.log('4. Add width/height attributes');
}

main();
