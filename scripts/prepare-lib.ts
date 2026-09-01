import fs from 'node:fs';import { readDataset } from './content-tools';
export function prepareProduct(productId:string):void{const output=readDataset(productId);fs.mkdirSync('src/generated',{recursive:true});fs.writeFileSync('src/generated/product.json',`${JSON.stringify(output,null,2)}\n`);}
