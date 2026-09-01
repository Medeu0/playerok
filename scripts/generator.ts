import fs from 'node:fs';
import path from 'node:path';

const write = (directory: string, name: string, value: unknown) =>
  fs.writeFileSync(path.join(directory, name), `${JSON.stringify(value, null, 2)}\n`);

export function createProductSkeleton(id: string, root = 'content', now = new Date()): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error('SKU slug must contain lowercase letters, numbers and hyphens only.');
  const directory = path.join(root, id);
  if (fs.existsSync(directory)) throw new Error(`Dataset "${id}" already exists.`);
  fs.mkdirSync(directory, { recursive: true });
  const verifiedAt = now.toLocaleDateString('ru-RU', { timeZone: 'UTC' });
  write(directory, 'metadata.json', {
    id, brand: 'GRAND MOBILE', title: `TODO: ${id}`, shortTitle: 'TODO', subtitle: 'Grand Mobile',
    verifiedAt, verifiedLong: 'TODO: дата проверки прописью', version: '0.1.0',
    disclaimer: 'TODO: добавьте честное предупреждение о границах материала.', storageKey: `gm-guide:${id}:v1`,
    labels: { organization: 'Организация', organizationLead: 'TODO: описание раздела', terms: 'RP-термины' },
    contentMarkers: { expected: [], forbidden: [] },
  });
  write(directory, 'sources.json', []); write(directory, 'sections.json', []); write(directory, 'rules.json', []);
  write(directory, 'rp-terms.json', []); write(directory, 'scenarios.json', []); write(directory, 'quiz.json', []);
  write(directory, 'checklist.json', []); write(directory, 'common-mistakes.json', []);
  write(directory, 'quick-prep.json', { modes: [] });
  write(directory, 'server-specific.json', { intro: 'TODO: опишите только проверяемые server-specific сведения.', items: [], noteFields: [] });
  write(directory, 'faq.json', []); write(directory, 'changelog.json', []);
  write(directory, 'thresholds.json', [{ min: 0, label: 'Нужно повторить' }, { min: 60, label: 'Средняя готовность' }, { min: 75, label: 'Хорошая готовность' }, { min: 85, label: 'Высокая готовность' }]);
  fs.writeFileSync(path.join(directory, 'README.md'), '# Untrusted generated SKU\n\n> Generated SKU contains no trusted factual content. Research and source validation are required before release.\n');
  return directory;
}
