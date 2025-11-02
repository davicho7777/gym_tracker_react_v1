const fs = require('fs');
const path = require('path');

// Create a small shim for react-router-dom that re-exports index.js as index.mjs
// This file is safe to run on Windows and *nix and is intended to be called from package.json postinstall.

function createShim() {
  const projectRoot = path.resolve(__dirname, '..');
  const targetDir = path.join(projectRoot, 'node_modules', 'react-router-dom', 'dist');
  const targetFile = path.join(targetDir, 'index.mjs');
  const content = "export * from './index.js';\n";

  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // If file exists and content is the same, do nothing
    if (fs.existsSync(targetFile)) {
      const existing = fs.readFileSync(targetFile, 'utf8');
      if (existing === content) {
        console.log('[create-router-shim] shim already present, skipping');
        return;
      }
    }

    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[create-router-shim] wrote shim to', targetFile);
  } catch (err) {
    console.error('[create-router-shim] failed to create shim:', err.message || err);
    process.exitCode = 1;
  }
}

createShim();
