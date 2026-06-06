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
    element.addEventListener("touchend", (event) => {
      event.preventDefault();
      callback();
    });
    element.addEventListener("click", callback);
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
    if (!badge && cartItems.length > 0) {
      badge = document.createElement('span');
      badge.classList.add('cart-badge');
      cartElement.appendChild(badge);
    }
    if (badge) {
      if (cartItems.length > 0) {
        badge.textContent = cartItems.length;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }
  }
}