/**
 * Safron – products.js
 * Product listing page with filters, search, pagination
 */
document.addEventListener('DOMContentLoaded', () => {
  const params   = new URLSearchParams(location.search);
  const category = params.get('category') || '';
  const query    = params.get('q') || '';
  let   currentPage = 1;
  let   currentSort = 'default';
  let   currentCat  = category;

  renderFilters();
  loadProducts();
  bindSort();

  // ── Load & render products ───────────────────────────────────────────────
  async function loadProducts(page = 1) {
    currentPage = page;
    showSkeletons();

    let url = `api/products.php?action=list&page=${page}&limit=12&sort=${currentSort}`;
    if (currentCat) url += `&category=${encodeURIComponent(currentCat)}`;
    if (query)      url  = `api/products.php?action=search&q=${encodeURIComponent(query)}`;

    try {
      const data = await api.get(url);
      renderProducts(data.products || []);
      renderPagination(data.pages || 1, page);
      updateResultCount(data.total || (data.products || []).length);
    } catch (e) {
      document.getElementById('productsGrid').innerHTML = '<p class="text-muted text-center" style="grid-column:1/-1;padding:40px">Failed to load products.</p>';
    }
  }

  function showSkeletons() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = Array(8).fill('<div class="skeleton skeleton-card"></div>').join('');
  }

  function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (!products.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px">
          <div style="font-size:48px;margin-bottom:16px">🔍</div>
          <h3>No products found</h3>
          <p class="text-muted" style="margin-top:8px">Try a different search or category.</p>
          <a href="products.html" class="btn btn-primary" style="margin-top:20px;display:inline-flex">View All Products</a>
        </div>`;
      return;
    }
    grid.innerHTML = products.map(buildProductCard).join('');
  }

  function renderPagination(pages, current) {
    const el = document.getElementById('pagination');
    if (!el || pages <= 1) { if (el) el.innerHTML = ''; return; }
    let html = '';
    for (let i = 1; i <= pages; i++) {
      html += `<button class="page-btn ${i === current ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    el.innerHTML = html;
    el.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => loadProducts(+btn.dataset.page));
    });
  }

  function updateResultCount(total) {
    const el = document.getElementById('resultCount');
    if (el) el.textContent = `${total} product${total !== 1 ? 's' : ''} found`;
  }

  // ── Filters ──────────────────────────────────────────────────────────────
  async function renderFilters() {
    const el = document.getElementById('categoryFilters');
    if (!el) return;
    try {
      const data = await api.get('api/products.php?action=categories');
      const cats = data.categories || [];
      el.innerHTML = cats.map(c => `
        <label class="filter-option ${currentCat === c.slug ? 'active' : ''}">
          <input type="radio" name="category" value="${c.slug}" ${currentCat === c.slug ? 'checked' : ''}>
          ${c.name} <span style="color:var(--text-muted);font-size:12px">(${c.product_count})</span>
        </label>`).join('');

      // All categories option
      el.insertAdjacentHTML('afterbegin', `
        <label class="filter-option ${!currentCat ? 'active' : ''}">
          <input type="radio" name="category" value="" ${!currentCat ? 'checked' : ''}> All Products
        </label>`);

      el.querySelectorAll('input[name=category]').forEach(inp => {
        inp.addEventListener('change', () => {
          currentCat = inp.value;
          el.querySelectorAll('.filter-option').forEach(l => l.classList.remove('active'));
          inp.closest('.filter-option').classList.add('active');
          loadProducts(1);
          // Update URL without reload
          const u = new URL(location.href);
          currentCat ? u.searchParams.set('category', currentCat) : u.searchParams.delete('category');
          history.pushState({}, '', u);
        });
      });
    } catch {}
  }

  function bindSort() {
    document.getElementById('sortSelect')?.addEventListener('change', function () {
      currentSort = this.value;
      loadProducts(1);
    });
  }
});
