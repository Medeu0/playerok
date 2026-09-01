import fs from 'node:fs';
import path from 'node:path';

export const datasetFiles = {
  metadata: 'metadata.json', sources: 'sources.json', sections: 'sections.json', rules: 'rules.json',
  terms: 'rp-terms.json', scenarios: 'scenarios.json', quiz: 'quiz.json', checklist: 'checklist.json',
  commonMistakes: 'common-mistakes.json', quickPrep: 'quick-prep.json', serverSpecific: 'server-specific.json', faq: 'faq.json', changelog: 'changelog.json', thresholds: 'thresholds.json',
} as const;

export function requestedProduct(argv = process.argv.slice(2)): string {
  const equals = argv.find((value) => value.startsWith('--product='))?.split('=')[1];
  const position = argv.indexOf('--product');
  const separated = position >= 0 ? argv[position + 1] : undefined;
  const configured = JSON.parse(fs.readFileSync('product.config.json', 'utf8')).product;
  return equals || separated || process.env.npm_config_product || configured;
}

export function readDataset(productId: string): Record<string, unknown> {
  const directory = path.join('content', productId);
  if (!fs.existsSync(directory)) throw new Error(`Dataset "${productId}" not found at ${directory}`);
  return Object.fromEntries(Object.entries(datasetFiles).map(([key, file]) => {
    const filename = path.join(directory, file);
    if (!fs.existsSync(filename)) throw new Error(`Required dataset file is missing: ${filename}`);
    try { return [key, JSON.parse(fs.readFileSync(filename, 'utf8'))]; }
    catch (error) { throw new Error(`Invalid JSON in ${filename}: ${(error as Error).message}`); }
  }));
}
