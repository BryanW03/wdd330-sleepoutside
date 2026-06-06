import { getLocalStorage, setLocalStorage, updateCartBadge, showAlert } from './utils.mjs';

function renderCartContents() {
  const cartItems = getLocalStorage('so-cart');
  const listEl = document.querySelector('.product-list');
  if (!listEl) return;

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    listEl.innerHTML = `
      <li class="cart-empty">
        <p>Your cart is empty. <a href="/index.html">Keep shopping</a></p>
      </li>`;
    updateCartTotal([]);
    updateCartBadge();
    return;
  }

  listEl.innerHTML = cartItems.map((item, index) => cartItemTemplate(item, index)).join('');
  updateCartTotal(cartItems);
  updateCartBadge();

  document.querySelectorAll('.cart-card__remove').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = parseInt(e.currentTarget.dataset.index);
      removeFromCart(index);
    });
  });

  document.querySelectorAll('.cart-card__qty-input').forEach(input => {
    input.addEventListener('change', e => {
      const index = parseInt(e.currentTarget.dataset.index);
      const newQty = parseInt(e.currentTarget.value);
      updateQty(index, newQty);
    });
  });

  // Wishlist move buttons
  document.querySelectorAll('.cart-card__wishlist').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = parseInt(e.currentTarget.dataset.index);
      moveToWishlist(index);
    });
  });
}

function cartItemTemplate(item, index) {
  const imgSrc = item.Image || (item.Images && item.Images.PrimaryLarge) || '';
  const colorName = item.Colors && item.Colors[0] ? item.Colors[0].ColorName : '';
  const qty = item.qty || 1;
  const lineTotal = (item.FinalPrice * qty).toFixed(2);
  const isSale = item.SuggestedRetailPrice > item.FinalPrice;

  return `<li class="cart-card">
    <a href="/product_pages/index.html?product=${item.Id}&category=tents" class="cart-card__image">
      <img src="${imgSrc}" alt="${item.Name}" />
    </a>
    <div class="cart-card__info">
      <h2 class="card__name">${item.Name}</h2>
      ${colorName ? `<p class="cart-card__color">${colorName}</p>` : ''}
      ${isSale ? `<p class="cart-card__original-price"><s>$${item.SuggestedRetailPrice}</s></p>` : ''}
      <button class="cart-card__wishlist" data-index="${index}">♡ Move to Wishlist</button>
    </div>
    <div class="cart-card__qty-wrap">
      <label for="qty-${index}" class="sr-only">Quantity</label>
      <input id="qty-${index}" class="cart-card__qty-input" type="number" min="1" value="${qty}" data-index="${index}" />
    </div>
    <p class="cart-card__price">$${lineTotal}</p>
    <button class="cart-card__remove" data-index="${index}" aria-label="Remove item">✕</button>
  </li>`;
}

function removeFromCart(index) {
  let cartItems = getLocalStorage('so-cart') || [];
  const removed = cartItems.splice(index, 1);
  setLocalStorage('so-cart', cartItems);
  if (removed.length) showAlert(`"${removed[0].Name}" removed.`, 'info', 2000);
  renderCartContents();
}

function updateQty(index, newQty) {
  let cartItems = getLocalStorage('so-cart') || [];
  if (newQty < 1 || isNaN(newQty)) { removeFromCart(index); return; }
  cartItems[index].qty = newQty;
  setLocalStorage('so-cart', cartItems);
  renderCartContents();
}

function moveToWishlist(index) {
  let cartItems = getLocalStorage('so-cart') || [];
  let wishlist = getLocalStorage('so-wishlist') || [];
  const item = cartItems[index];
  if (!item) return;
  if (!wishlist.find(w => w.Id === item.Id)) wishlist.push(item);
  setLocalStorage('so-wishlist', wishlist);
  cartItems.splice(index, 1);
  setLocalStorage('so-cart', cartItems);
  showAlert(`"${item.Name}" moved to wishlist.`, 'info', 2500);
  renderCartContents();
}

function updateCartTotal(items) {
  const total = items.reduce((s, i) => s + (i.FinalPrice || 0) * (i.qty || 1), 0);
  const itemCount = items.reduce((s, i) => s + (i.qty || 1), 0);
  const totalEl = document.querySelector('.cart-total');
  if (totalEl) {
    totalEl.innerHTML = `
      <div class="cart-total__row"><span>Items</span><span>${itemCount}</span></div>
      <div class="cart-total__row"><span>Shipping</span><span>${total > 100 ? 'Free' : '$9.99'}</span></div>
      <div class="cart-total__amount"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartContents();
  updateCartBadge();
});