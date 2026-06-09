import { setLocalStorage, getLocalStorage, updateCartBadge, showAlert } from './utils.mjs';

function getImageSrc(product) {
  if (product.Image) return product.Image;
  if (product.Images && product.Images.PrimaryLarge) return product.Images.PrimaryLarge;
  if (product.Images && product.Images.PrimaryMedium) return product.Images.PrimaryMedium;
  return '';
}

export default class ProductDetail {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
    this.selectedColor = null;
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);
    if (!this.product) {
      document.querySelector('.product-detail').innerHTML = '<p>Product not found.</p>';
      return;
    }
    this._updateBreadcrumb();
    this.renderProductDetails('.product-detail');
    updateCartBadge();
  }

  _updateBreadcrumb() {
    const bc = document.querySelector('.breadcrumb');
    if (!bc) return;
    const category = new URLSearchParams(window.location.search).get('category') || 'tents';
    const catLabel = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
    bc.innerHTML = `
      <li><a href="/index.html">Home</a></li>
      <li><span>›</span></li>
      <li><a href="/index.html?category=${category}">${catLabel}</a></li>
      <li><span>›</span></li>
      <li><span>${this.product.Name}</span></li>
    `;
  }

  addToCart() {
    let cartItems = getLocalStorage('so-cart');
    if (!Array.isArray(cartItems)) cartItems = [];
    const existingIndex = cartItems.findIndex(i => i.Id === this.product.Id);
    if (existingIndex >= 0) {
      cartItems[existingIndex].qty = (cartItems[existingIndex].qty || 1) + 1;
    } else {
      cartItems.push({ ...this.product, qty: 1, selectedColor: this.selectedColor });
    }
    setLocalStorage('so-cart', cartItems);
    showAlert(`"${this.product.Name}" added to cart!`, 'success', 3000);
    this._btnFeedback();
  }

  toggleWishlist() {
    let wishlist = getLocalStorage('so-wishlist') || [];
    const idx = wishlist.findIndex(i => i.Id === this.product.Id);
    const btn = document.getElementById('wishlistBtn');
    if (idx >= 0) {
      wishlist.splice(idx, 1);
      if (btn) btn.textContent = '♡ Save to Wishlist';
      showAlert('Removed from wishlist.', 'info', 2000);
    } else {
      wishlist.push(this.product);
      if (btn) btn.textContent = '♥ Saved!';
      showAlert('Added to wishlist!', 'success', 2000);
    }
    setLocalStorage('so-wishlist', wishlist);
  }

  _btnFeedback() {
    const btn = document.getElementById('addToCart');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '✓ Added!';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500);
  }

  _loadComments() {
    return getLocalStorage(`so-comments-${this.product.Id}`) || [];
  }

  _saveComment(text, author) {
    const comments = this._loadComments();
    comments.push({ text, author: author || 'Anonymous', date: new Date().toLocaleDateString() });
    setLocalStorage(`so-comments-${this.product.Id}`, comments);
  }

  _renderComments(container) {
    const comments = this._loadComments();
    const list = container.querySelector('.comments__list');
    if (!list) return;
    if (!comments.length) {
      list.innerHTML = '<p class="comments__empty">No comments yet. Be the first!</p>';
      return;
    }
    list.innerHTML = comments.map(c => `
      <div class="comment">
        <div class="comment__header">
          <span class="comment__author">${c.author}</span>
          <span class="comment__date">${c.date}</span>
        </div>
        <p class="comment__text">${c.text}</p>
      </div>
    `).join('');
  }

  renderProductDetails(selector) {
    const container = document.querySelector(selector);
    if (!container || !this.product) return;

    const colors = this.product.Colors || [];

    // ── Correct image field: ColorPreviewImageSrc (backpacks/sleeping-bags)
    // or ColorImg (tents). Fall back to main product image.
    const getColorImg = (c) =>
      c.ColorPreviewImageSrc ||
      c.ColorImg ||
      getImageSrc(this.product);

    const firstImg = colors.length > 0
      ? getColorImg(colors[0])
      : getImageSrc(this.product);

    this.selectedColor = colors[0]?.ColorName || null;

    const isSale = this.product.SuggestedRetailPrice > this.product.FinalPrice;
    const discountPct = isSale
      ? Math.round(((this.product.SuggestedRetailPrice - this.product.FinalPrice) / this.product.SuggestedRetailPrice) * 100)
      : 0;

    // Color swatches — only if more than 1 color
    let colorSwatches = '';
    if (colors.length > 1) {
      const swatchButtons = colors.map((c, i) => `
        <button
          class="color-swatch${i === 0 ? ' active' : ''}"
          data-index="${i}"
          data-color="${c.ColorName}"
          data-img="${getColorImg(c)}"
          title="${c.ColorName}"
        >
          <img
            class="color-swatch__chip"
            src="${c.ColorChipImageSrc || ''}"
            alt="${c.ColorName}"
            onerror="this.style.display='none'"
          />
          <span class="color-swatch__label">${c.ColorName}</span>
        </button>
      `).join('');

      colorSwatches = `
        <div class="product-colors">
          <p class="product-colors__label">
            Color: <span id="color-selected-name">${colors[0].ColorName}</span>
          </p>
          <div class="product-colors__swatches">${swatchButtons}</div>
        </div>
      `;
    } else if (colors[0]) {
      colorSwatches = `<p class="product__color">Color: <strong>${colors[0].ColorName}</strong></p>`;
    }

    const wishlist = getLocalStorage('so-wishlist') || [];
    const inWishlist = wishlist.some(i => i.Id === this.product.Id);

    // Image LEFT, info RIGHT — explicit grid placement
    container.innerHTML = `
      <div class="product-detail__grid">
        <div class="product-detail__image-wrap">
          ${isSale
            ? `<span class="product-card__discount product-card__discount--detail">-${discountPct}%</span>`
            : ''}
          <img
            id="product-main-img"
            src="${firstImg}"
            alt="${this.product.Name}"
            onerror="this.style.opacity='0.3';"
          />
        </div>
        <div class="product-detail__info">
          <p class="card__brand">${this.product.Brand.Name}</p>
          <h1 class="product-detail__name">${this.product.NameWithoutBrand}</h1>
          <div class="product-card__price product-detail__price">
            ${isSale
              ? `<span class="price--original">$${this.product.SuggestedRetailPrice}</span>
                 <span class="price--sale">$${this.product.FinalPrice}</span>
                 <span class="price--badge">Save ${discountPct}%</span>`
              : `<span style="font-size:1.4rem;font-weight:700;">$${this.product.FinalPrice}</span>`
            }
          </div>
          ${colorSwatches}
          <div class="product__description">${this.product.DescriptionHtmlSimple || ''}</div>
          <div class="product-detail__actions">
            <button id="addToCart" class="btn btn--primary product-detail__add-btn">Add to Cart</button>
            <button id="wishlistBtn" class="btn btn--secondary product-detail__wish-btn">
              ${inWishlist ? '♥ Saved!' : '♡ Save to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      <section class="comments-section">
        <h2 class="comments__title">Customer Comments</h2>
        <div class="comments__list"></div>
        <div class="comment-form">
          <h3 class="comment-form__title">Leave a Comment</h3>
          <input type="text" id="comment-author" class="comment-form__input" placeholder="Your name (optional)" />
          <textarea id="comment-text" class="comment-form__textarea" placeholder="Share your experience…" rows="3"></textarea>
          <button id="submit-comment" class="btn btn--primary">Post Comment</button>
        </div>
      </section>
    `;

    // ── Color swatch click → change main image with fade ──────────────
    container.querySelectorAll('.color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.selectedColor = btn.dataset.color;
        const nameEl = document.getElementById('color-selected-name');
        if (nameEl) nameEl.textContent = this.selectedColor;

        const newImg  = btn.dataset.img;
        const mainImg = document.getElementById('product-main-img');
        if (mainImg && newImg) {
          mainImg.style.opacity = '0';
          mainImg.style.transition = 'opacity 0.2s ease';
          setTimeout(() => {
            mainImg.src = newImg;
            mainImg.onload = () => { mainImg.style.opacity = '1'; };
            setTimeout(() => { mainImg.style.opacity = '1'; }, 400);
          }, 200);
        }
      });
    });

    document.getElementById('addToCart').addEventListener('click', this.addToCart.bind(this));
    document.getElementById('wishlistBtn').addEventListener('click', this.toggleWishlist.bind(this));

    this._renderComments(container);
    document.getElementById('submit-comment').addEventListener('click', () => {
      const text   = document.getElementById('comment-text').value.trim();
      const author = document.getElementById('comment-author').value.trim();
      if (!text) return;
      this._saveComment(text, author);
      document.getElementById('comment-text').value   = '';
      document.getElementById('comment-author').value = '';
      this._renderComments(container);
    });
  }
}