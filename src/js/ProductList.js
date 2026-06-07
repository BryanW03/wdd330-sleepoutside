import { renderListWithTemplate } from './utils.mjs';

function getImageSrc(product) {
  if (product.Image) return product.Image;
  if (product.Images && product.Images.PrimaryLarge) return product.Images.PrimaryLarge;
  if (product.Images && product.Images.PrimaryMedium) return product.Images.PrimaryMedium;
  return '';
}

function productCardTemplate(product) {
  const imgSrc = getImageSrc(product);
  const isSale = product.SuggestedRetailPrice > product.FinalPrice;
  const discountPct = isSale
    ? Math.round(((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice) * 100)
    : 0;

  return `<li class="product-card">
    <a href="/product_pages/index.html?product=${product.Id}&category=${product.category || ''}">
      ${isSale ? `<span class="product-card__discount">-${discountPct}%</span>` : ''}
      <img src="${imgSrc}" alt="Image of ${product.Name}" loading="lazy" onerror="this.style.display='none'">
      <div class="product-card__info">
        <p class="card__brand">${product.Brand.Name}</p>
        <h2 class="card__name">${product.NameWithoutBrand}</h2>
        <div class="product-card__price">
          ${isSale
            ? `<span class="price--original">$${product.SuggestedRetailPrice}</span>
               <span class="price--sale">$${product.FinalPrice}</span>`
            : `<span>$${product.FinalPrice}</span>`
          }
        </div>
      </div>
    </a>
  </li>`;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.allProducts = [];
  }

  async init() {
    const list = await this.dataSource.getData();
    list.forEach(p => (p.category = this.category));
    this.allProducts = list;
    this.renderList(this.allProducts);
    this._setupControls();
  }

  renderList(list) {
    if (list.length === 0) {
      this.listElement.innerHTML = '<li class="no-results">No products found.</li>';
      return;
    }
    renderListWithTemplate(productCardTemplate, this.listElement, list, 'afterbegin', true);
  }

  _filterProducts(query) {
    const q = query.toLowerCase().trim();
    if (!q) return this.allProducts;
    return this.allProducts.filter(p =>
      p.Name.toLowerCase().includes(q) ||
      p.Brand.Name.toLowerCase().includes(q) ||
      (p.NameWithoutBrand && p.NameWithoutBrand.toLowerCase().includes(q))
    );
  }

  _sortProducts(list, sortBy) {
    const sorted = [...list];
    switch (sortBy) {
      case 'price-asc':  return sorted.sort((a, b) => a.FinalPrice - b.FinalPrice);
      case 'price-desc': return sorted.sort((a, b) => b.FinalPrice - a.FinalPrice);
      case 'name-asc':   return sorted.sort((a, b) => a.Name.localeCompare(b.Name));
      case 'name-desc':  return sorted.sort((a, b) => b.Name.localeCompare(a.Name));
      case 'discount':
        return sorted.sort((a, b) => {
          const dA = a.SuggestedRetailPrice > a.FinalPrice
            ? (a.SuggestedRetailPrice - a.FinalPrice) / a.SuggestedRetailPrice : 0;
          const dB = b.SuggestedRetailPrice > b.FinalPrice
            ? (b.SuggestedRetailPrice - b.FinalPrice) / b.SuggestedRetailPrice : 0;
          return dB - dA;
        });
      default: return sorted;
    }
  }

  _setupControls() {
    const searchInput = document.getElementById('product-search');
    const sortSelect  = document.getElementById('product-sort');

    const refresh = () => {
      const query  = searchInput ? searchInput.value : '';
      const sortBy = sortSelect  ? sortSelect.value  : 'default';
      const filtered = this._filterProducts(query);
      const sorted   = this._sortProducts(filtered, sortBy);
      this.renderList(sorted);
    };

    if (searchInput) searchInput.addEventListener('input', refresh);
    if (sortSelect)  sortSelect.addEventListener('change', refresh);
  }
}