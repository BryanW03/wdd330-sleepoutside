import ProductData from './ProductData.mjs';
import ProductList from './ProductList.js';
import { getParam } from './utils.mjs';

const category = getParam('category');
const dataSource = new ProductData();
const listElement = document.querySelector('.product-list');


if (category) {
  const titleElement = document.querySelector('.products h2, main h2');
  if (titleElement) {
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    titleElement.textContent = `Top Products: ${formattedCategory}`;
  }
}

const myList = new ProductList(category, dataSource, listElement);
myList.init();