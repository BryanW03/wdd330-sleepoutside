import { getLocalStorage, setLocalStorage } from './utils.mjs';
import ProductData from './ProductData.mjs';

const dataSource = new ProductData('tents');

function addProductToCart(product) {
  // 1. Intentamos obtener el contenido actual del carrito en LocalStorage
  let cartItems = getLocalStorage('so-cart');
  
  // 2. Si no es una lista válida (está vacío o es la primera vez), inicializamos un arreglo vacío []
  if (!Array.isArray(cartItems)) {
    cartItems = [];
  }
  
  // 3. Agregamos el nuevo producto seleccionado a la lista existente
  cartItems.push(product);
  
  // 4. Guardamos la lista completa actualizada de vuelta en el LocalStorage
  setLocalStorage('so-cart', cartItems);
}

// add to cart button event handler
async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

// add listener to Add to Cart button
document
  .getElementById('addToCart')
  .addEventListener('click', addToCartHandler);