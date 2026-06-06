import { renderListWithTemplate } from './utils.mjs';

function productCardTemplate(product) {
  const imgSrc = product.Image || (product.Images && product.Images.PrimaryLarge) || '';
  const isSale = product.SuggestedRetailPrice > product.FinalPrice;
  const discountPct = isSale
    ? Math.round(((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice) * 100)
    : 0;

  return `<li class="product-card">
    <a href="/product_pages/index.html?product=${product.Id}&category=${product.category || ''}">
      ${isSale ? `<span class="product-card__discount">-${discountPct}%</span>` : ''}
      <img src="${imgSrc}" alt="Image of ${product.Name}" loading="lazy">
      <h3 class="card__brand">${product.Brand.Name}</h3>
      <h2 class="card__name">${product.NameWithoutBrand}</h2>
      <p class="product-card__price">
        ${isSale
          ? `<span class="price--original">$${product.SuggestedRetailPrice}</span>
             <span class="price--sale">$${product.FinalPrice}</span>`
          : `$${product.FinalPrice}`
        }
      </p>
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

  // ── Search ──────────────────────────────────────────────────────────────
  _filterProducts(query) {
    const q = query.toLowerCase().trim();
    if (!q) return this.allProducts;
    return this.allProducts.filter(p =>
      p.Name.toLowerCase().includes(q) ||
      p.Brand.Name.toLowerCase().includes(q) ||
      (p.NameWithoutBrand && p.NameWithoutBrand.toLowerCase().includes(q))
    );
  }

  // ── Sort ────────────────────────────────────────────────────────────────
  _sortProducts(list, sortBy) {
    const sorted = [...list];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.FinalPrice - b.FinalPrice);
      case 'price-desc':
        return sorted.sort((a, b) => b.FinalPrice - a.FinalPrice);
      case 'name-asc':
        return sorted.sort((a, b) => a.Name.localeCompare(b.Name));
      case 'name-desc':
        return sorted.sort((a, b) => b.Name.localeCompare(a.Name));
      case 'discount':
        return sorted.sort((a, b) => {
          const discA = a.SuggestedRetailPrice > a.FinalPrice
            ? (a.SuggestedRetailPrice - a.FinalPrice) / a.SuggestedRetailPrice : 0;
          const discB = b.SuggestedRetailPrice > b.FinalPrice
            ? (b.SuggestedRetailPrice - b.FinalPrice) / b.SuggestedRetailPrice : 0;
          return discB - discA;
        });
      default:
        return sorted;
    }
  }

  // ── Wire up search + sort controls ──────────────────────────────────────
  _setupControls() {
    const searchInput = document.getElementById('product-search');
    const sortSelect = document.getElementById('product-sort');

    const refresh = () => {
      const query = searchInput ? searchInput.value : '';
      const sortBy = sortSelect ? sortSelect.value : 'default';
      const filtered = this._filterProducts(query);
      const sorted = this._sortProducts(filtered, sortBy);
      this.renderList(sorted);
    };

    if (searchInput) {
      searchInput.addEventListener('input', refresh);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', refresh);
    }
  }
}