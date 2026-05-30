import { getCartCount } from "./cart-count.mjs";

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function renderListWithTemplate(templateFn, parentElement, list, position = 'afterbegin', clear = false) {
  if (clear) {
    parentElement.innerHTML = '';
  }
  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(''));
}

export function alertMessage(message, scroll = true) {
  const alert = document.createElement("div");
  alert.classList.add("alert");
  
  const span = document.createElement("span");
  span.innerText = message;
  
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "X";
  closeBtn.classList.add("alert-close");
  
  alert.appendChild(span);
  alert.appendChild(closeBtn);
  
  alert.addEventListener("click", function (e) {
    if (e.target.classList.contains("alert-close") || e.target.innerText === "X") {
      const main = document.querySelector("main");
      main.removeChild(this);
    }
  });
  
  const main = document.querySelector("main");
  main.prepend(alert);
  
  if (scroll) {
    window.scrollTo(0, 0);
  }
}

export function removeAllAlerts() {
  const alerts = document.querySelectorAll(".alert");
  const main = document.querySelector("main");
  alerts.forEach((alert) => main.removeChild(alert));
}

export async function loadHeaderFooter() {
  const headerTemplate = "header.html";
  const footerTemplate = "footer.html";
  const headerElement = document.getElementById("main-header");
  const footerElement = document.getElementById("main-footer");
  
  const headerRes = await fetch(`../partials/${headerTemplate}`);
  const footerRes = await fetch(`../partials/${footerTemplate}`);
  
  if (headerRes.ok && footerRes.ok) {
    const headerHtml = await headerRes.text();
    const footerHtml = await footerRes.text();
    
    headerElement.innerHTML = headerHtml;
    footerElement.innerHTML = footerHtml;
    
    getCartCount();
  }
}