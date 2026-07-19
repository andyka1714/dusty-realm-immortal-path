import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST_ROOT = join(process.cwd(), 'dist');
const ASSET_ROOT = join(DIST_ROOT, 'assets');
const MAX_ASSET_BYTES = 50 * 1024 * 1024;
const MAX_ASSET_FILES = 12_000;

const walk = (directory: string): string[] => {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const filePath = join(directory, entry);
    const stats = statSync(filePath);
    if (stats.isDirectory()) files.push(...walk(filePath));
    else files.push(filePath);
  }
  return files;
};

if (!statSync(DIST_ROOT, { throwIfNoEntry: false }) || !statSync(ASSET_ROOT, { throwIfNoEntry: false })) {
  throw new Error('找不到 dist/assets，請先執行 npm run build');
}

const files = walk(ASSET_ROOT);
const totalBytes = files.reduce((total, filePath) => total + statSync(filePath).size, 0);
const forbidden = files.filter((filePath) => {
  const normalized = relative(ASSET_ROOT, filePath).replaceAll('\\', '/');
  const basename = normalized.split('/').at(-1) ?? '';
  const isRuntimeFrame = normalized.includes('/frames/') && basename.endsWith('.png');
  return !isRuntimeFrame && (
    basename === 'pipeline-meta.json' ||
    basename === 'prompt-used.txt' ||
    basename === 'animation.gif' ||
    basename.endsWith('.txt') ||
    basename === 'sheet-transparent.png' ||
    basename.startsWith('raw-') ||
    normalized.includes('/Users/') ||
    normalized.includes('/tmp/')
  );
});

const hashes = new Map<string, string>();
const duplicateGroups = new Set<string>();
for (const filePath of files) {
  const hash = createHash('sha256').update(readFileSync(filePath)).digest('hex');
  const previous = hashes.get(hash);
  if (previous) duplicateGroups.add(previous);
  else hashes.set(hash, relative(ASSET_ROOT, filePath));
}

console.log(JSON.stringify({
  assetFiles: files.length,
  assetMiB: Number((totalBytes / 1024 / 1024).toFixed(2)),
  forbiddenFiles: forbidden.map((filePath) => relative(ASSET_ROOT, filePath)),
  duplicateGroups: duplicateGroups.size,
}, null, 2));

if (files.length > MAX_ASSET_FILES) throw new Error(`正式素材檔案數超過 ${MAX_ASSET_FILES}`);
if (totalBytes > MAX_ASSET_BYTES) throw new Error(`正式素材超過 ${MAX_ASSET_BYTES / 1024 / 1024} MiB`);
if (forbidden.length > 0) throw new Error('正式素材包含禁止交付的生成期檔案');
