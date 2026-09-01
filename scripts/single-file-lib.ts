import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { build as viteBuild } from 'vite';
import { productSchema } from '../src/data/schema';

export interface SingleFileBuildResult {
  product: string;
  version: string;
  verifiedAt: string;
  file: string;
  sizeBytes: number;
  builtAt: string;
  inlinedScripts: number;
  inlinedStyles: number;
}

const TMP_OUT_DIR = path.join('dist', '.singlefile-tmp');

function bin(name: string): string {
  return path.join('node_modules', '.bin', process.platform === 'win32' ? `${name}.cmd` : name);
}

/**
 * Runs the existing prepare-product step (content/<sku>/*.json -> src/generated/product.json)
 * exactly as the normal `npm run build` does via its `prebuild` hook, then validates the
 * result against the same Zod schema the app itself parses at runtime. Reusing this step
 * instead of re-reading content/ ourselves keeps the single-file export on the same data
 * pipeline as the hosted build — no second source of truth for how a product is assembled.
 */
function prepareAndValidate(productId: string): { version: string; verifiedAt: string } {
  if (!fs.existsSync(path.join('content', productId))) {
    throw new Error(`Unknown SKU "${productId}": no content/${productId} directory.`);
  }
  const prepare = spawnSync(bin('tsx'), ['scripts/prepare-product.ts', `--product=${productId}`], {
    stdio: 'inherit',
  });
  if (prepare.status) throw new Error(`prepare-product failed for "${productId}"`);

  const raw = JSON.parse(fs.readFileSync('src/generated/product.json', 'utf8'));
  const result = productSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Dataset for "${productId}" failed validation:\n${issues}`);
  }
  return { version: result.data.metadata.version, verifiedAt: result.data.metadata.verifiedAt };
}

function readAttr(tag: string, name: string): string | null {
  // Attribute order in Vite's emitted <link>/<script> tags isn't guaranteed to be
  // stable across build modes (production vs. the mode vitest runs under), so
  // attributes are matched independently rather than assuming a fixed order.
  const match = new RegExp(`\\s${name}=["']([^"']*)["']`, 'i').exec(tag);
  return match ? match[1] : null;
}

/** Inlines every external `<link rel="stylesheet">` and `<script type="module" src>` in an HTML document. */
function inlineAssets(html: string, outDir: string): { html: string; scriptRefs: number; styleRefs: number } {
  let scriptRefs = 0;
  let styleRefs = 0;

  let result = html.replace(/<link\b[^>]*>/g, (tag) => {
    const rel = readAttr(tag, 'rel');
    const href = readAttr(tag, 'href');
    if (rel === 'stylesheet' && href) {
      styleRefs++;
      // Handles both the source form (`@import url('https://...');`) and the
      // minified form esbuild/Vite emits (`@import"https://...";`, no url()).
      const css = readAsset(outDir, href).replace(
        /@import\s*(?:url\()?["']https:\/\/fonts\.googleapis\.com[^"')]*["']\)?;?/g,
        '',
      );
      return `<style>${css}</style>`;
    }
    // Preload/prefetch/manifest/icon hints are unnecessary once everything is
    // inlined and would otherwise be a dangling reference to a file that no
    // longer ships with the bundle.
    if (rel && ['modulepreload', 'preload', 'icon', 'manifest'].includes(rel)) return '';
    return tag;
  });

  result = result.replace(/<script\b[^>]*>\s*<\/script>/g, (tag) => {
    const type = readAttr(tag, 'type');
    const src = readAttr(tag, 'src');
    if (type === 'module' && src) {
      scriptRefs++;
      const js = readAsset(outDir, src);
      return `<script type="module">${js}</script>`;
    }
    return tag;
  });

  return { html: result, scriptRefs, styleRefs };
}

function readAsset(outDir: string, href: string): string {
  const clean = href.replace(/^\.?\//, '');
  return fs.readFileSync(path.join(outDir, clean), 'utf8');
}

function injectProductMeta(html: string, meta: { id: string; title: string; version: string; verifiedAt: string }): string {
  const description = `Grand Mobile — ${meta.title}`;
  const tags = [
    `<title>${escapeHtml(description)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="product-id" content="${escapeHtml(meta.id)}">`,
    `<meta name="product-version" content="${escapeHtml(meta.version)}">`,
    `<meta name="verified-at" content="${escapeHtml(meta.verifiedAt)}">`,
  ].join('');
  let result = html.replace(/<title>[^<]*<\/title>/, '');
  result = result.replace(/<meta name=["']description["'][^>]*>/, '');
  result = result.replace('</head>', `${tags}</head>`);
  return result;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Fails the build if the exported HTML still references any external runtime asset. */
function assertNoExternalRefs(html: string, productId: string): void {
  const offenders = [
    /src=["']\/(?!\/)[^"']*["']/g,
    /href=["']\/assets\/[^"']*["']/g,
    /\/assets\//g,
    /fonts\.googleapis\.com/g,
  ];
  for (const pattern of offenders) {
    if (pattern.test(html)) {
      throw new Error(
        `Single-file export for "${productId}" still references an external asset (pattern: ${pattern}). ` +
          `This usually means the build produced more than one JS chunk (check for dynamic import()).`,
      );
    }
  }
}

/**
 * Builds one SKU into a fully self-contained `dist/<sku>.html`.
 * Pipeline: content/<sku> -> prepare+validate -> Vite production build (single JS/CSS
 * chunk, no source maps) -> HTML asset inlining -> product meta injection -> validation.
 */
export async function buildSingleFileProduct(productId: string): Promise<SingleFileBuildResult> {
  const { version, verifiedAt } = prepareAndValidate(productId);
  const generated = JSON.parse(fs.readFileSync('src/generated/product.json', 'utf8'));

  fs.rmSync(TMP_OUT_DIR, { recursive: true, force: true });

  // React (and other libraries) resolve their dev-vs-production build partly
  // from the ambient `process.env.NODE_ENV`, not just Vite's `mode` option —
  // so a caller with NODE_ENV=test (e.g. this file's own vitest suite) or
  // NODE_ENV=development would otherwise silently ship the bloated,
  // unminified React dev build (full of console-warning strings) inside a
  // file meant for a paying buyer. Force it for the duration of the build.
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    await viteBuild({
      configFile: path.resolve('vite.config.ts'),
      mode: 'production',
      base: './',
      define: { __SINGLE_FILE__: true },
      build: {
        outDir: TMP_OUT_DIR,
        emptyOutDir: true,
        cssCodeSplit: false,
        assetsInlineLimit: 100_000_000,
        sourcemap: false,
        minify: true,
        rollupOptions: { output: { manualChunks: undefined } },
      },
      logLevel: 'warn',
    });
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
  }

  const indexPath = path.join(TMP_OUT_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) throw new Error('Vite build did not produce index.html');
  const rawHtml = fs.readFileSync(indexPath, 'utf8');

  const { html: inlined, scriptRefs, styleRefs } = inlineAssets(rawHtml, TMP_OUT_DIR);
  const withMeta = injectProductMeta(inlined, {
    id: generated.metadata.id,
    title: generated.metadata.title,
    version,
    verifiedAt,
  });

  assertNoExternalRefs(withMeta, productId);
  if (!withMeta.includes(`"${generated.metadata.id}"`) && !withMeta.includes(generated.metadata.id)) {
    throw new Error(`Exported HTML for "${productId}" does not contain the product dataset.`);
  }

  fs.mkdirSync('dist', { recursive: true });
  const outFile = path.join('dist', `${productId}.html`);
  fs.writeFileSync(outFile, withMeta);
  fs.rmSync(TMP_OUT_DIR, { recursive: true, force: true });

  const sizeBytes = fs.statSync(outFile).size;
  const builtAt = new Date().toISOString();

  fs.writeFileSync(
    path.join('dist', `${productId}.build.json`),
    JSON.stringify(
      { product: productId, version, verifiedAt, file: `${productId}.html`, sizeBytes, builtAt },
      null,
      2,
    ) + '\n',
  );

  return {
    product: productId,
    version,
    verifiedAt,
    file: outFile,
    sizeBytes,
    builtAt,
    inlinedScripts: scriptRefs,
    inlinedStyles: styleRefs,
  };
}
