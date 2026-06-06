import { getLocalStorage, setLocalStorage, updateCartBadge } from './utils.mjs';

function renderCheckoutItems() {
  const cartItems = getLocalStorage('so-cart') || [];
  const itemsEl = document.getElementById('checkout-items');
  const totalEl = document.getElementById('checkout-total');

  if (!itemsEl) return;

  if (!cartItems.length) {
    itemsEl.innerHTML = '<li class="cart-empty">Your cart is empty.</li>';
    return;
  }

  itemsEl.innerHTML = cartItems.map(item => {
    const imgSrc = item.Image || (item.Images && item.Images.PrimaryLarge) || '';
    const qty = item.qty || 1;
    return `
      <li class="checkout-item">
        <img src="${imgSrc}" alt="${item.Name}" />
        <div>
          <p class="checkout-item__name">${item.Name}</p>
          <p class="checkout-item__qty">Qty: ${qty}</p>
        </div>
        <p class="checkout-item__price">$${(item.FinalPrice * qty).toFixed(2)}</p>
      </li>
    `;
  }).join('');

  const subtotal = cartItems.reduce((s, i) => s + (i.FinalPrice * (i.qty || 1)), 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  if (totalEl) {
    totalEl.innerHTML = `
      <div class="cart-total__amount" style="flex-direction:column;gap:0.4rem;align-items:stretch;">
        <div style="display:flex;justify-content:space-between;font-weight:400;font-size:0.9rem;color:#6b5e4e;">
          <span>Subtotal</span><span>$${subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:400;font-size:0.9rem;color:#6b5e4e;">
          <span>Tax (8%)</span><span>$${tax.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:400;font-size:0.9rem;color:#6b5e4e;">
          <span>Shipping</span><span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.1rem;padding-top:0.5rem;border-top:1px solid #e8e4de;">
          <span>Total</span><span>$${total.toFixed(2)}</span>
        </div>
      </div>
    `;
  }
}

function validateAndSubmit() {
  const required = ['firstName', 'lastName', 'street', 'city', 'state', 'zip', 'cardNumber', 'expiry', 'cvv'];
  for (const id of required) {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      el && el.focus();
      el && el.style.setProperty('border-color', '#c0392b');
      return false;
    }
    el.style.setProperty('border-color', '');
  }
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutItems();
  updateCartBadge();

  const btn = document.getElementById('place-order-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      if (!validateAndSubmit()) return;
      // Clear cart
      setLocalStorage('so-cart', []);
      document.getElementById('checkout-form').style.display = 'none';
      document.getElementById('order-confirmation').style.display = 'block';
      updateCartBadge();
    });
  }
});