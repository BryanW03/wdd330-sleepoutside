import ProductData from './ProductData.mjs';
import ProductList from './ProductList.js';

const params = new URLSearchParams(window.location.search);
const category = params.get('category') || 'tents';

const dataSource = new ProductData(category);
const element = document.querySelector('.product-list');
const productList = new ProductList(category, dataSource, element);

productList.init();