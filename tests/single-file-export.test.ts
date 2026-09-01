import { describe, expect, it, afterAll } from 'vitest';
import fs from 'node:fs';
import { buildSingleFileProduct } from '../scripts/single-file-lib';

const OUT_FILE = 'dist/army-ss.html';
const MANIFEST_FILE = 'dist/army-ss.build.json';

describe('single-file export', () => {
  it(
    'builds a self-contained dist/<sku>.html for a valid SKU',
    async () => {
      const result = await buildSingleFileProduct('army-ss');

      expect(result.product).toBe('army-ss');
      expect(result.file).toBe(OUT_FILE);
      expect(fs.existsSync(OUT_FILE)).toBe(true);

      const html = fs.readFileSync(OUT_FILE, 'utf8');

      // Dataset is embedded, not fetched at runtime.
      expect(html).toContain('army-ss');
      expect(html).toContain('meta name="product-id" content="army-ss"');

      // No external runtime asset references survive the inlining step.
      expect(html).not.toMatch(/\/assets\//);
      expect(html).not.toMatch(/href=["']\/assets\/[^"']*["']/);
      expect(html).not.toMatch(/src=["']\/(?!\/)[^"']*["']/);
      expect(html).not.toContain('rel="manifest"');

      // CSS and JS are inlined, not linked.
      expect(html).toContain('<style>');
      expect(html).not.toMatch(/<link[^>]*rel=["']stylesheet["']/);
      expect(html).toContain('<script type="module">');
      expect(html).not.toMatch(/<script[^>]*type=["']module["'][^>]*src=/);

      // File-mode build never registers a service worker: the `__SINGLE_FILE__`
      // define is statically true, so the minifier dead-code-eliminates the
      // `serviceWorker.register(...)` call entirely.
      expect(html).not.toMatch(/serviceWorker\.register/);
      expect(html).not.toContain('/sw.js');

      expect(result.sizeBytes).toBeGreaterThan(1000);
      expect(fs.existsSync(MANIFEST_FILE)).toBe(true);
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
      expect(manifest.product).toBe('army-ss');
      expect(manifest.file).toBe('army-ss.html');
    },
    30_000,
  );

  it('rejects an unknown SKU without touching the filesystem', async () => {
    await expect(buildSingleFileProduct('../../etc')).rejects.toThrow();
    await expect(buildSingleFileProduct('does-not-exist')).rejects.toThrow(/Unknown SKU/);
  });

  it(
    'overwrites cleanly on a second build (no leftover temp dir, no stale content)',
    async () => {
      await buildSingleFileProduct('army-ss');
      expect(fs.existsSync('dist/.singlefile-tmp')).toBe(false);
      const html = fs.readFileSync(OUT_FILE, 'utf8');
      expect(html).toContain('meta name="product-id" content="army-ss"');
    },
    30_000,
  );

  afterAll(() => {
    fs.rmSync(OUT_FILE, { force: true });
    fs.rmSync(MANIFEST_FILE, { force: true });
  });
});
