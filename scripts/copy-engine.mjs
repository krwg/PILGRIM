import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vendor = join(root, 'vendor', 'palimpsest');

let eng;
try {
  eng = dirname(require.resolve('@krwg/palimpsest/package.json'));
} catch {
  console.error('Install @krwg/palimpsest (or keep committed vendor/palimpsest).');
  process.exit(1);
}

const dist = join(eng, 'dist');
if (!existsSync(dist)) {
  console.error('Engine dist missing — run build in palimpsest first.');
  process.exit(1);
}

rmSync(vendor, { recursive: true, force: true });
mkdirSync(vendor, { recursive: true });
cpSync(dist, vendor, { recursive: true });
console.log('copied @krwg/palimpsest dist → vendor/palimpsest/');
