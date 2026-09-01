import { requestedProduct } from './content-tools';import { prepareProduct } from './prepare-lib';
const productId=requestedProduct();prepareProduct(productId);console.log(`Prepared product: ${productId}`);
