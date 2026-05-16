import ProductData from './ProductData.mjs';
import ProductList from './ProductList.js';

const dataSource = new ProductData('tents');
const element = document.querySelector('.product-list');
const productList = new ProductList('tents', dataSource, element);

productList.init();
