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
      if (stat && stat.isDirectory() && !file.includes('node_modules')) {
        results = results.concat(walk(file));
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    });
  } catch(e) {}
  return results;
}

const files = walk(path.join(__dirname, 'components'));

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let hasEarlyReturn = false;
  let inComponentContent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // reset if new function
    if (line.match(/(const|function) [A-Z].*(props|\(\))/)) {
      hasEarlyReturn = false;
      inComponentContent = true;
    }
    
    // reset if return statement without condition (end of component mostly)
    if (line.trim().startsWith('return ')) {
      // not ideal, but somewhat works
    }
    
    if (inComponentContent && line.match(/if\s*\(.*return/)) {
      hasEarlyReturn = true;
    }
    
    if (inComponentContent && hasEarlyReturn && line.match(/(useState|useEffect|useCallback|useRef|useMemo)\(/)) {
      console.log(`${file}:${i+1} => Hook after return`);
      hasEarlyReturn = false; // report once per block
    }
    
    // Check conditional hook
    if (inComponentContent && line.match(/(useState|useEffect|useCallback|useRef|useMemo)\(/)) {
       let prevLine = lines[i-1] || '';
       if (prevLine.match(/if\s*\(/) && !prevLine.match(/return/)) {
          console.log(`${file}:${i+1} => Conditional hook`);
       }
    }
  }
}
