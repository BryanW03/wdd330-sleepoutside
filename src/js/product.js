import { getLocalStorage, setLocalStorage } from './utils.mjs';
import ProductData from './ProductData.mjs';
import ProductComments from './ProductComments.mjs';

const dataSource = new ProductData('tents');
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('product');

if (productId) {
  const comments = new ProductComments(productId, 'main');
  comments.init();
}

function addProductToCart(product) {
  let cartItems = getLocalStorage('so-cart');

  if (!Array.isArray(cartItems)) {
    cartItems = [];
  }

  cartItems.push(product);
  setLocalStorage('so-cart', cartItems);
}

async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

document
  .getElementById('addToCart')
  .addEventListener('click', addToCartHandler);