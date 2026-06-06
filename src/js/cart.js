import { getLocalStorage, setLocalStorage, updateCartBadge, showAlert } from './utils.mjs';

function renderCartContents() {
  const cartItems = getLocalStorage('so-cart');
  const listEl = document.querySelector('.product-list');

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    listEl.innerHTML =
      '<li class="cart-empty"><p>Your cart is empty. <a href="/index.html">Keep shopping</a></p></li>';
    updateCartTotal([]);
    updateCartBadge();
    return;
  }

  listEl.innerHTML = cartItems.map((item, index) => cartItemTemplate(item, index)).join('');
  updateCartTotal(cartItems);
  updateCartBadge();

  // Remove listeners
  document.querySelectorAll('.cart-card__remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      removeFromCart(index);
    });
  });

  // Qty change listeners
  document.querySelectorAll('.cart-card__qty-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      const newQty = parseInt(e.currentTarget.value);
      updateQty(index, newQty);
    });
  });
}

function cartItemTemplate(item, index) {
  const imgSrc = item.Image || (item.Images && item.Images.PrimaryLarge) || '';
  const colorName = item.Colors && item.Colors[0] ? item.Colors[0].ColorName : '';
  const qty = item.qty || 1;
  const lineTotal = (item.FinalPrice * qty).toFixed(2);
  const isSale = item.SuggestedRetailPrice > item.FinalPrice;

  return `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img src="${imgSrc}" alt="${item.Name}" />
  </a>
  <div class="cart-card__info">
    <h2 class="card__name">${item.Name}</h2>
    ${colorName ? `<p class="cart-card__color">${colorName}</p>` : ''}
    ${isSale ? `<p class="cart-card__original-price"><s>$${item.SuggestedRetailPrice}</s></p>` : ''}
  </div>
  <div class="cart-card__qty-wrap">
    <label for="qty-${index}" class="sr-only">Quantity</label>
    <input
      id="qty-${index}"
      class="cart-card__qty-input"
      type="number"
      min="1"
      value="${qty}"
      data-index="${index}"
    />
  </div>
  <p class="cart-card__price">$${lineTotal}</p>
  <button class="cart-card__remove" data-index="${index}" aria-label="Remove item">✕</button>
</li>`;
}

function removeFromCart(index) {
  let cartItems = getLocalStorage('so-cart') || [];
  const removed = cartItems.splice(index, 1);
  setLocalStorage('so-cart', cartItems);
  if (removed.length) {
    showAlert(`"${removed[0].Name}" removed from cart.`, 'info', 2500);
  }
  renderCartContents();
}

function updateQty(index, newQty) {
  let cartItems = getLocalStorage('so-cart') || [];
  if (newQty < 1 || isNaN(newQty)) {
    removeFromCart(index);
    return;
  }
  cartItems[index].qty = newQty;
  setLocalStorage('so-cart', cartItems);
  renderCartContents();
}

function updateCartTotal(items) {
  const total = items.reduce((sum, item) => sum + (item.FinalPrice || 0) * (item.qty || 1), 0);
  const itemCount = items.reduce((sum, item) => sum + (item.qty || 1), 0);
  const totalEl = document.querySelector('.cart-total');
  if (totalEl) {
    totalEl.innerHTML = `
      <span class="cart-total__count">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
      <span class="cart-total__amount">Total: <strong>$${total.toFixed(2)}</strong></span>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartContents();
  updateCartBadge();
});