import { setLocalStorage, getLocalStorage, updateCartBadge, showAlert } from './utils.mjs';

export default class ProductDetail {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);
    if (!this.product) {
      document.querySelector('.product-detail').innerHTML =
        '<p class="error-msg">Product not found.</p>';
      return;
    }
    this._updateBreadcrumb();
    this.renderProductDetails('.product-detail');
    updateCartBadge();
  }

  _updateBreadcrumb() {
    const bc = document.querySelector('.breadcrumb');
    if (!bc || !this.product) return;
    const category = new URLSearchParams(window.location.search).get('category') || 'tents';
    const catLabel = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
    bc.innerHTML = `
      <a href="/index.html">Home</a> &rsaquo;
      <a href="/index.html?category=${category}">${catLabel}</a> &rsaquo;
      <span>${this.product.Name}</span>
    `;
  }

  addToCart() {
    let cartItems = getLocalStorage('so-cart');
    if (!Array.isArray(cartItems)) cartItems = [];

    const existingIndex = cartItems.findIndex(item => item.Id === this.product.Id);
    if (existingIndex >= 0) {
      cartItems[existingIndex].qty = (cartItems[existingIndex].qty || 1) + 1;
    } else {
      cartItems.push({ ...this.product, qty: 1 });
    }

    setLocalStorage('so-cart', cartItems);
    showAlert(`"${this.product.Name}" added to cart!`, 'success', 3000);
    this._showButtonFeedback();
  }

  _showButtonFeedback() {
    const btn = document.getElementById('addToCart');
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = '✓ Added!';
    btn.style.backgroundColor = '#3a7d44';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.style.backgroundColor = '';
      btn.disabled = false;
    }, 1500);
  }

  renderProductDetails(selector) {
    const container = document.querySelector(selector);
    if (!container || !this.product) return;

    const imgSrc = this.product.Image || (this.product.Images && this.product.Images.PrimaryLarge) || '';
    const isSale = this.product.SuggestedRetailPrice > this.product.FinalPrice;
    const discountPct = isSale
      ? Math.round(((this.product.SuggestedRetailPrice - this.product.FinalPrice) / this.product.SuggestedRetailPrice) * 100)
      : 0;
    const colorName = this.product.Colors && this.product.Colors[0]
      ? this.product.Colors[0].ColorName : '';

    container.innerHTML = `
      <h3 class="card__brand">${this.product.Brand.Name}</h3>
      <h2 class="divider">${this.product.NameWithoutBrand}</h2>
      <div class="product-detail__image-wrap">
        ${isSale ? `<span class="product-card__discount product-card__discount--detail">-${discountPct}%</span>` : ''}
        <img class="divider" src="${imgSrc}" alt="${this.product.Name}" />
      </div>
      <p class="product-card__price">
        ${isSale
          ? `<span class="price--original">$${this.product.SuggestedRetailPrice}</span>
             <span class="price--sale">$${this.product.FinalPrice}</span>
             <span class="price--badge">Save ${discountPct}%</span>`
          : `$${this.product.FinalPrice}`
        }
      </p>
      ${colorName ? `<p class="product__color">${colorName}</p>` : ''}
      <div class="product__description">${this.product.DescriptionHtmlSimple || ''}</div>
      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
      </div>
    `;

    document.getElementById('addToCart').addEventListener('click', this.addToCart.bind(this));
  }
}
