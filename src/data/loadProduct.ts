import raw from '../generated/product.json';import{productSchema}from'./schema';import type{ProductData}from'../types/content';
export const product=productSchema.parse(raw) as ProductData;
