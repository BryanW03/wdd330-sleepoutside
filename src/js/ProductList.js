import { renderListWithTemplate } from './utils.mjs';

function productCardTemplate(product) {
  const imgSrc = product.Image || (product.Images && product.Images.PrimaryLarge) || '';
  const isSale = product.SuggestedRetailPrice > product.FinalPrice;
  const discountPct = isSale
    ? Math.round(((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice) * 100)
    : 0;

  return `<li class="product-card">
    <a href="product_pages/index.html?product=${product.Id}&category=${product.category || ''}">
      ${isSale ? `<span class="product-card__discount">-${discountPct}%</span>` : ''}
      <img src="${imgSrc}" alt="Image of ${product.Name}">
      <h3 class="card__brand">${product.Brand.Name}</h3>
      <h2 class="card__name">${product.NameWithoutBrand}</h2>
      <p class="product-card__price">
        ${isSale ? `<span class="price--original">$${product.SuggestedRetailPrice}</span> ` : ''}
        $${product.FinalPrice}
      </p>
    </a>
  </li>`;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    const list = await this.dataSource.getData();
    list.forEach(p => p.category = this.category);
    this.renderList(list);
  }

  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list, 'afterbegin', true);
  }
}