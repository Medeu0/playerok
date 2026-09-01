type Item = { id?: string; title?: string; body?: string; status?: string; sourceIds?: string[] };
type Issue = { level: 'error' | 'warning'; code: string; message: string };
export type AuditReport = { errors: Issue[]; warnings: Issue[]; metrics: Record<string, number> };
const normalized = (value: string) => value.trim().toLocaleLowerCase('ru').replace(/\s+/g, ' ');
const duplicates = (values: string[]) => values.filter((value, index) => values.indexOf(value) !== index);

export function auditDataset(raw: any, expectedSlug: string): AuditReport {
  const issues: Issue[] = [];
  const add = (level: Issue['level'], code: string, message: string) => issues.push({ level, code, message });
  const sources = Array.isArray(raw.sources) ? raw.sources : [];
  const sourceIds = new Set<string>();
  for (const source of sources) {
    if (!source.id || sourceIds.has(source.id)) add('error', 'source-id', `Source id is empty or duplicated: ${source.id || '<empty>'}`);
    sourceIds.add(source.id);
    if (!source.url?.trim()) add('error', 'source-url', `Source ${source.id || '<empty>'} has an empty URL.`);
  }
  const metadata = raw.metadata || {};
  if (metadata.id !== expectedSlug) add('error', 'slug', `metadata.id "${metadata.id}" does not match requested product "${expectedSlug}".`);
  if (!metadata.version?.trim() || !metadata.verifiedAt?.trim()) add('error', 'metadata', 'metadata.version and metadata.verifiedAt are required.');
  if (!metadata.storageKey?.includes(expectedSlug) || /^gm-guide:(new|template|product):/i.test(metadata.storageKey || '')) add('error', 'storage-key', 'storageKey must be product-specific and include the SKU slug.');
  const groups: Item[][] = [raw.sections, raw.rules, raw.terms, raw.commonMistakes, raw.quiz].filter(Array.isArray);
  for (const item of groups.flat()) {
    if (!item.id || (!item.title && !(item as any).question) || (!item.body && !(item as any).explanation)) add('error', 'required-content', `Item ${item.id || '<empty>'} has empty required content.`);
    if (!['official', 'server_specific', 'training'].includes(item.status || '')) add('error', 'status', `Item ${item.id || '<empty>'} has invalid status.`);
    if (item.status === 'official' && !item.sourceIds?.length) add('error', 'official-source', `Official item ${item.id} has no sourceIds.`);
    for (const ref of item.sourceIds || []) if (!sourceIds.has(ref)) add('error', 'source-ref', `Item ${item.id} references unknown source ${ref}.`);
  }
  const quiz = Array.isArray(raw.quiz) ? raw.quiz : [];
  for (const id of duplicates(quiz.map((q: any) => q.id))) add('error', 'quiz-id', `Duplicate quiz id: ${id}`);
  for (const question of quiz) {
    const options = Array.isArray(question.options) ? question.options : [];
    if (!Number.isInteger(question.correctOption) || question.correctOption < 0 || question.correctOption >= options.length) add('error', 'correct-option', `Question ${question.id} has invalid correctOption.`);
    if (options.length < 2 || new Set(options.map(normalized)).size !== options.length) add('error', 'quiz-options', `Question ${question.id} needs at least two unique options.`);
    if (!['easy','medium','hard'].includes(question.difficulty)) add('error', 'difficulty', `Question ${question.id} has invalid difficulty.`);
    if (!question.explanation?.trim()) add('error', 'explanation', `Question ${question.id} has an empty explanation.`);
  }
  for (const text of duplicates(quiz.map((q: any) => normalized(q.question || '')))) add('error', 'quiz-duplicate', `Duplicate quiz question: ${text}`);
  const allContentIds=new Set<string>([...(raw.sections||[]),...(raw.rules||[]),...(raw.terms||[]),...(raw.commonMistakes||[]),...(raw.scenarios||[]),...quiz].map((item:any)=>item.id));
  for(const mode of raw.quickPrep?.modes||[])for(const step of mode.steps||[])for(const id of step.itemIds||[])if(!allContentIds.has(id))add('error','quick-prep-ref',`Quick prep references unknown item ${id}.`);
  const scenarios = Array.isArray(raw.scenarios) ? raw.scenarios : [];
  for (const id of duplicates(scenarios.map((s: any) => s.id))) add('error', 'scenario-id', `Duplicate scenario id: ${id}`);
  for (const scenario of scenarios) {
    if (scenario.status !== 'training') add('error', 'scenario-status', `Scenario ${scenario.id} must have status=training.`);
    if (!scenario.evaluationPoints?.length || scenario.evaluationPoints.some((point: string) => !point.trim())) add('error', 'scenario-points', `Scenario ${scenario.id} needs evaluation points.`);
  }
  const auditableContent = { ...raw, metadata: { ...metadata, contentMarkers: undefined } };
  const serialized = JSON.stringify(auditableContent).toLocaleLowerCase('ru');
  for (const marker of metadata.contentMarkers?.expected || []) if (!serialized.includes(normalized(marker))) add('warning', 'expected-marker', `Expected product marker not found: ${marker}`);
  for (const marker of metadata.contentMarkers?.forbidden || []) if (serialized.includes(normalized(marker))) add('warning', 'forbidden-marker', `Possible cross-SKU contamination: ${marker}`);
  return { errors: issues.filter((issue) => issue.level === 'error'), warnings: issues.filter((issue) => issue.level === 'warning'), metrics: { sources: sources.length, knowledge: (raw.sections?.length || 0) + (raw.rules?.length || 0) + (raw.terms?.length || 0) + (raw.commonMistakes?.length || 0), terms: raw.terms?.length || 0, quiz: quiz.length, scenarios: scenarios.length, checklist: raw.checklist?.length || 0, faq: raw.faq?.length || 0 } };
}
