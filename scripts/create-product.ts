import { createProductSkeleton } from './generator';
const id = process.argv[2];
if (!id) throw new Error('Usage: npm run create-product -- police-ss');
console.log(`Created safe empty skeleton: ${createProductSkeleton(id)}`);
console.log('Generated SKU contains no trusted factual content. Research and source validation are required before release.');
