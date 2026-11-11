import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

async function run() {
  // 1. Build classic IIFE bundle so index.html works via file:// and static servers without Vite
  await build({
    entryPoints: ['src/main.js'],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    outfile: 'app.bundle.js'
  });

  // 2. Copy IIFE bundle into dist/ for direct file:// opening of dist/index.html
  if (fs.existsSync('dist')) {
    fs.copyFileSync('app.bundle.js', path.join('dist', 'app.bundle.js'));

    // Strip crossorigin attribute on stylesheet in dist/index.html so file:// doesn't block local CSS
    const distHtmlPath = path.join('dist', 'index.html');
    if (fs.existsSync(distHtmlPath)) {
      let html = fs.readFileSync(distHtmlPath, 'utf-8');
      html = html.replace(/<link rel="stylesheet" crossorigin /g, '<link rel="stylesheet" ');
      fs.writeFileSync(distHtmlPath, html, 'utf-8');
    }
  }

  console.log('✓ Standalone IIFE fallback bundle built: app.bundle.js & dist/app.bundle.js');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
