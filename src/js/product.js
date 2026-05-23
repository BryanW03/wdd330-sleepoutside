import { getParam } from './utils.mjs';
import ProductData from './ProductData.mjs';

const dataSource = new ProductData();
const productId = getParam('product');

function productDetailsTemplate(product) {
  return `<h3>${product.Brand.Name}</h3>
  <h2 class="divider">${product.NameWithoutBrand}</h2>
  <img class="divider" src="${product.Images.PrimaryLarge}" alt="${product.NameWithoutBrand}" />
  <p class="product-card__price">$${product.FinalPrice}</p>
  <p class="product__color">${product.Colors[0].ColorName}</p>
  <p class="product__description">${product.DescriptionHtmlSimple}</p>
  <div class="product-detail__add">
    <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
  </div>`;
}

function renderProductDetails(product) {
  const element = document.querySelector('.product-detail');
  element.innerHTML = productDetailsTemplate(product);
}

async function init() {
  if (productId) {
    const product = await dataSource.findProductById(productId);
    renderProductDetails(product);
    
    document.getElementById('addToCart').addEventListener('click', () => {
      let cartItems = JSON.parse(localStorage.getItem('so-cart')) || [];
      if (!Array.isArray(cartItems)) cartItems = [];
      cartItems.push(product);
      localStorage.setItem('so-cart', JSON.stringify(cartItems));
    });
  }
}

init();