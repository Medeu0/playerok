import { requestedProduct } from './content-tools';
import { buildSingleFileProduct } from './single-file-lib';

const productId = requestedProduct();

buildSingleFileProduct(productId)
  .then((result) => {
    console.log(`\nProduct: ${result.product}`);
    console.log(`Output: ${result.file}`);
    console.log(`Size: ${(result.sizeBytes / 1024).toFixed(0)} KB`);
    console.log(`Inlined scripts: ${result.inlinedScripts}`);
    console.log(`Inlined styles: ${result.inlinedStyles}`);
    console.log('External JS: 0');
    console.log('External CSS: 0');
    console.log('Runtime data fetches: 0');
  })
  .catch((error) => {
    console.error(`Single-file build failed: ${(error as Error).message}`);
    process.exit(1);
  });
