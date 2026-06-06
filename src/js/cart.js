import { getLocalStorage, setLocalStorage } from './utils.mjs';

function renderCartContents() {
  const cartItems = getLocalStorage('so-cart');

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    document.querySelector('.product-list').innerHTML =
      '<li class="cart-empty"><p>Your cart is empty. <a href="/index.html">Keep shopping</a></p></li>';
    updateCartTotal([]);
    return;
  }

  const htmlItems = cartItems.map((item, index) => cartItemTemplate(item, index));
  document.querySelector('.product-list').innerHTML = htmlItems.join('');
  updateCartTotal(cartItems);

  // Attach remove button listeners
  document.querySelectorAll('.cart-card__remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      removeFromCart(index);
    });
  });
}

function cartItemTemplate(item, index) {
  const imgSrc = item.Image || (item.Images && item.Images.PrimaryLarge) || '';
  const colorName = item.Colors && item.Colors[0] ? item.Colors[0].ColorName : '';

  return `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img src="${imgSrc}" alt="${item.Name}" />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${colorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
  <button class="cart-card__remove" data-index="${index}" aria-label="Remove item">✕</button>
</li>`;
}

function removeFromCart(index) {
  let cartItems = getLocalStorage('so-cart') || [];
  cartItems.splice(index, 1);
  setLocalStorage('so-cart', cartItems);
  renderCartContents();
}

function updateCartTotal(items) {
  const total = items.reduce((sum, item) => sum + (item.FinalPrice || 0), 0);
  const totalEl = document.querySelector('.cart-total');
  if (totalEl) {
    totalEl.textContent = `Total: $${total.toFixed(2)}`;
  }
}

renderCartContents();