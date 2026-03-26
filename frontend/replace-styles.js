import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(file));
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    });
  } catch(e) {}
  return results;
}

const files = walk(path.join(__dirname, 'components'));
const srcComponents = path.join(__dirname, 'src', 'components');
if (fs.existsSync(srcComponents)) {
  files.push(...walk(srcComponents));
}

let changedFilesCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Pattern replacements
  newContent = newContent.replace(/\bbg-zinc-700\b/g, 'bg-surfaceHigh');
  newContent = newContent.replace(/\btext-zinc-900\b/g, 'text-text');
  
  // bg-black to bg-surface. Exclude if followed by /, to keep bg-black/50, etc.
  newContent = newContent.replace(/\bbg-black(?!\/)/g, 'bg-surface');
  
  newContent = newContent.replace(/\bbg-gray-900\b/g, 'bg-surface');
  newContent = newContent.replace(/\bhover:bg-zinc-800\b/g, 'hover:bg-surfaceHigh');
  newContent = newContent.replace(/\bborder-zinc-700\b/g, 'border-outline');
  newContent = newContent.replace(/\bbg-neutral-800\b/g, 'bg-surfaceContainer');

  // text-white outside dark: prefix. So NOT preceded by dark:
  // Using negative lookbehind (?<!dark:)text-white
  newContent = newContent.replace(/(?<!dark:)text-white\b/g, 'text-background');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFilesCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Done! Updated ${changedFilesCount} files.`);
