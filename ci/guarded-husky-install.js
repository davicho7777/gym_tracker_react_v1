const { spawnSync } = require('child_process');

function hasGit() {
  try {
    const res = spawnSync('git', ['--version'], { stdio: 'ignore' });
    return res && res.status === 0;
  } catch (err) {
    return false;
  }
}

if (!hasGit()) {
  console.log('[guarded-husky-install] git not found; skipping husky install');
  process.exit(0);
}

console.log('[guarded-husky-install] git found; running husky install');
try {
  const res = spawnSync('npx', ['husky', 'install'], { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error('[guarded-husky-install] husky install exited with code', res.status);
    process.exit(res.status || 1);
  }
} catch (err) {
  console.error('[guarded-husky-install] failed to run husky install:', err && err.message ? err.message : err);
  process.exit(1);
}
