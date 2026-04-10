/**
 * build.mjs – Copy static frontend assets into dist/ for GitHub Pages deployment.
 * Copies index.html, css/, and js/ (excludes api/ and database/ which require a PHP server).
 */
import fs   from 'fs';
import path from 'path';

const SRC  = new URL('.', import.meta.url).pathname;
const DIST = path.join(SRC, 'dist');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean and recreate dist
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// Copy static assets
fs.copyFileSync(path.join(SRC, 'index.html'), path.join(DIST, 'index.html'));
copyDir(path.join(SRC, 'css'), path.join(DIST, 'css'));
copyDir(path.join(SRC, 'js'),  path.join(DIST, 'js'));

console.log('Build complete → dist/');
