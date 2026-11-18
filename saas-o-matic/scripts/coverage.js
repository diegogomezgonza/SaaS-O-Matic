import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { generateCoverageReport } from './coverage-report.js';

const cwd = fileURLToPath(new URL('..', import.meta.url));
function run(args) {
  return spawnSync(process.execPath, args, { cwd, stdio: 'inherit' }).status ?? 1;
}
const unit = run([
  'node_modules/vitest/vitest.mjs',
  'run',
  '--coverage',
  '--reporter=default',
  '--reporter=json',
  '--outputFile=coverage-run.json',
]);
const e2e = unit === 0 ? run(['scripts/check-browser.js']) : null;
const build = unit === 0 ? run(['node_modules/vite/bin/vite.js', 'build']) : null;
generateCoverageReport({ unit, e2e, build });
const passed = unit === 0 && e2e === 0 && build === 0;
const png = passed ? run(['scripts/export-coverage.js']) : null;
process.exitCode = passed && png === 0 ? 0 : 1;
