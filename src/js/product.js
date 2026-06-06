import { getParam, updateCartBadge } from './utils.mjs';
import ProductData from './ProductData.mjs';
import ProductDetail from './ProductDetails.mjs';

const category = getParam('category') || 'tents';
const productId = getParam('product');

if (productId) {
  const dataSource = new ProductData(category);
  const product = new ProductDetail(productId, dataSource);
  product.init();
}

document.addEventListener('DOMContentLoaded', updateCartBadge);