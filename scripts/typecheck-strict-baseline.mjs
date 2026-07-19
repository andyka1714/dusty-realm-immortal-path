import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const baseline = 87;
const tsc = join(process.cwd(), 'node_modules/.bin/tsc');
const result = spawnSync(tsc, ['--noEmit', '--strict', '--allowJs', 'false'], { encoding: 'utf8' });
if (result.error) throw result.error;
const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
const errorCount = (output.match(/error TS\d+/g) ?? []).length;
console.log(`strict TypeScript errors: ${errorCount} (baseline: ${baseline})`);
if (result.status !== 0 && errorCount > baseline) {
  console.error('strict TypeScript error count increased; fix new errors before merging.');
  process.exit(1);
}
