import { setLocalStorage, getLocalStorage, updateCartBadge } from './utils.mjs';

export default class ProductDetail {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);
    this.renderProductDetails('.product-detail');
    const addButton = document.getElementById('addToCart');
    if (addButton) {
      addButton.addEventListener('click', this.addToCart.bind(this));
    }
    updateCartBadge();
  }

  addToCart() {
    let cartItems = getLocalStorage('so-cart');
    if (!Array.isArray(cartItems)) {
      cartItems = [];
    }
    cartItems.push(this.product);
    setLocalStorage('so-cart', cartItems);
    this.showAddedFeedback();
  }

  showAddedFeedback() {
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

  renderProductDetails(selector) {
    const container = document.querySelector(selector);
    if (!container || !this.product) return;

    const imgSrc = this.product.Image || (this.product.Images && this.product.Images.PrimaryLarge) || '';
    const isSale = this.product.SuggestedRetailPrice > this.product.FinalPrice;
    const discountPct = isSale
      ? Math.round(((this.product.SuggestedRetailPrice - this.product.FinalPrice) / this.product.SuggestedRetailPrice) * 100)
      : 0;

    container.innerHTML = `
      <h3>${this.product.Brand.Name}</h3>
      <h2 class="divider">${this.product.NameWithoutBrand}</h2>
      <img class="divider" src="${imgSrc}" alt="${this.product.Name}" />
      <p class="product-card__price">
        ${isSale
          ? `<span class="price--original">$${this.product.SuggestedRetailPrice}</span>
             <span class="price--sale">$${this.product.FinalPrice}</span>
             <span class="price--badge">Save ${discountPct}%</span>`
          : `$${this.product.FinalPrice}`
        }
      </p>
      <p class="product__color">${this.product.Colors && this.product.Colors[0] ? this.product.Colors[0].ColorName : ''}</p>
      <p class="product__description">${this.product.DescriptionHtmlSimple || ''}</p>
      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
      </div>
    `;
  }
}