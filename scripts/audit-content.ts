import { auditDataset } from './audit-lib';import { readDataset, requestedProduct } from './content-tools';
const id=requestedProduct(),report=auditDataset(readDataset(id),id);
for(const issue of [...report.errors,...report.warnings]) console.log(`${issue.level.toUpperCase()} [${issue.code}] ${issue.message}`);
console.log(`Audit ${id}: ${report.errors.length} error(s), ${report.warnings.length} warning(s).`);if(report.errors.length)process.exit(1);
