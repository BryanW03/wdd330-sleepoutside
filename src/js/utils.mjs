export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  updateCartBadge();
}

export function setClick(selector, callback) {
  const element = qs(selector);
  if (element) {
    element.addEventListener('touchend', (event) => {
      event.preventDefault();
      callback();
    });
    element.addEventListener('click', callback);
  }
}

export function renderListWithTemplate(templateFn, parentElement, list, position = 'afterbegin', clear = false) {
  if (clear) {
    parentElement.innerHTML = '';
  }
  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(''));
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function updateCartBadge() {
  const cartItems = getLocalStorage('so-cart') || [];
  const cartElement = qs('.cart');
  if (cartElement) {
    let badge = qs('.cart-badge', cartElement);
    if (!badge) {
      badge = document.createElement('span');
      badge.classList.add('cart-badge');
      cartElement.appendChild(badge);
    }
    if (cartItems.length > 0) {
      badge.textContent = cartItems.length;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }
}

export function showAlert(message, type = 'info', duration = 3000) {
  const existing = document.querySelector('.site-alert');
  if (existing) existing.remove();

  const alert = document.createElement('div');
  alert.className = `site-alert site-alert--${type}`;
  alert.setAttribute('role', 'alert');
  alert.innerHTML = `
    <span class="site-alert__message">${message}</span>
    <button class="site-alert__close" aria-label="Close">&times;</button>
  `;

  const header = document.querySelector('header');
  if (header && header.nextSibling) {
    header.parentNode.insertBefore(alert, header.nextSibling);
  } else {
    document.body.prepend(alert);
  }

  alert.querySelector('.site-alert__close').addEventListener('click', () => alert.remove());

  if (duration > 0) {
    setTimeout(() => alert && alert.remove(), duration);
  }
}