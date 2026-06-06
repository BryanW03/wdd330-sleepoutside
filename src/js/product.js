import { getLocalStorage, setLocalStorage, getParam } from './utils.mjs';
import ProductData from './ProductData.mjs';

// Read category and product ID from URL params
const category = getParam('category') || 'tents';
const productId = getParam('product');

const dataSource = new ProductData(category);

// Render product details dynamically
async function renderProductDetail() {
  if (!productId) return;

  const product = await dataSource.findProductById(productId);
  if (!product) return;

  const imgSrc = product.Image || (product.Images && product.Images.PrimaryLarge) || '';
  const isSale = product.SuggestedRetailPrice > product.FinalPrice;
  const discountPct = isSale
    ? Math.round(((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice) * 100)
    : 0;

  const container = document.querySelector('.product-detail');
  if (!container) return;

  container.innerHTML = `
    <h3>${product.Brand.Name}</h3>
    <h2 class="divider">${product.NameWithoutBrand}</h2>
    <img class="divider" src="${imgSrc}" alt="${product.Name}" />
    <p class="product-card__price">
      ${isSale
        ? `<span class="price--original">$${product.SuggestedRetailPrice}</span>
           <span class="price--sale">$${product.FinalPrice}</span>
           <span class="price--badge">Save ${discountPct}%</span>`
        : `$${product.FinalPrice}`
      }
    </p>
    <p class="product__color">${product.Colors && product.Colors[0] ? product.Colors[0].ColorName : ''}</p>
    <p class="product__description">${product.DescriptionHtmlSimple || ''}</p>
    <div class="product-detail__add">
      <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
    </div>
  `;

  // Re-attach event listener after rendering
  document.getElementById('addToCart').addEventListener('click', addToCartHandler);
}

function addProductToCart(product) {
  let cartItems = getLocalStorage('so-cart');
  if (!Array.isArray(cartItems)) {
    cartItems = [];
  }
  cartItems.push(product);
  setLocalStorage('so-cart', cartItems);
  showAddedFeedback();
}

function showAddedFeedback() {
  const btn = document.getElementById('addToCart');
  if (!btn) return;
  const original = btn.textContent;
  btn.textContent = '✓ Added!';
  btn.style.backgroundColor = '#3a7d44';
  setTimeout(() => {
    btn.textContent = original;
    btn.style.backgroundColor = '';
  }, 1500);
}

async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

// If page has a static addToCart button (old product pages), attach listener
const staticBtn = document.getElementById('addToCart');
if (staticBtn) {
  staticBtn.addEventListener('click', addToCartHandler);
}

// If page has a .product-detail container, render dynamically
if (document.querySelector('.product-detail') && productId) {
  renderProductDetail();
}