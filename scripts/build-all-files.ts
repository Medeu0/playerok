/**
 * Builds a single-file .html for every SKU under content/ whose metadata.json
 * has `"releaseReady": true`. Skips generated/skeleton SKUs that aren't ready
 * to sell (see docs/ADDING_PRODUCT.md for the SKU lifecycle).
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildSingleFileProduct } from './single-file-lib';

const contentDir = 'content';
const skus = fs
  .readdirSync(contentDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => {
    const metaPath = path.join(contentDir, name, 'metadata.json');
    if (!fs.existsSync(metaPath)) return false;
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    return meta.releaseReady === true;
  });

if (!skus.length) {
  console.log('No release-ready SKUs found (metadata.json needs "releaseReady": true).');
  process.exit(0);
}

(async () => {
  for (const sku of skus) {
    console.log(`\n=== Building ${sku} ===`);
    const result = await buildSingleFileProduct(sku);
    console.log(`Output: ${result.file} (${(result.sizeBytes / 1024).toFixed(0)} KB)`);
  }
})().catch((error) => {
  console.error(`build:files failed: ${(error as Error).message}`);
  process.exit(1);
});
