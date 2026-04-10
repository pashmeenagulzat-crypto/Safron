/**
 * js/app.js
 * Main application entry – product listing, filters, search, checkout, toast system
 */

import { initCart, addToCart, clearCart, getCart } from './cart.js';
import { openPreview }                              from './preview.js';

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await initCart();
  await loadCategories();
  await loadProducts();
  bindSearch();
  bindCheckoutForm();
  bindScrollTop();
  bindNavLinks();
  bindFilterAll();
});

// ── Toast System ──────────────────────────────────────────────
const toastWrap = document.getElementById('toastWrap');

export function showToast(message, type = 'info', duration = 3500) {
  const toast = document.createElement('div');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast__icon">${icons[type] || 'ℹ️'}</span><span class="toast__msg">${message}</span>`;
  toastWrap.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ── Products & Categories ─────────────────────────────────────
let allProducts = [];
let activeCategory = 'all';
let searchTerm     = '';

async function loadCategories() {
  try {
    const res  = await fetch('api/products.php?action=categories');
    const json = await res.json();
    if (!json.success) return;

    const filtersEl = document.getElementById('categoryFilters');
    if (!filtersEl) return;

    json.data.forEach(cat => {
      const btn = document.createElement('button');
      btn.className   = 'filter-btn';
      btn.dataset.slug = cat.slug;
      btn.textContent  = cat.name;
      btn.addEventListener('click', () => setCategory(cat.slug, btn));
      filtersEl.appendChild(btn);
    });
  } catch (_) { /* silent */ }
}

async function loadProducts(params = {}) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  renderSkeletons(grid);

  const qs = new URLSearchParams({ action: 'list', ...params });
  try {
    const res  = await fetch(`api/products.php?${qs}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    allProducts = json.data;
    renderProducts(grid, allProducts);
  } catch (_) {
    grid.innerHTML = '<p style="padding:40px;text-align:center;color:var(--color-muted)">Could not load products. Please refresh.</p>';
  }
}

function setCategory(slug, btn) {
  activeCategory = slug;
  document.querySelectorAll('#categoryFilters .filter-btn, .filter-btn[data-cat="all"]').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');

  const params = slug === 'all' ? {} : { category: slug };
  if (searchTerm) params.search = searchTerm;
  loadProducts(params);
}

function renderSkeletons(grid, count = 6) {
  grid.innerHTML = Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line price"></div>
      </div>
    </div>`).join('');
}

function renderProducts(grid, products) {
  if (!products || products.length === 0) {
    grid.innerHTML = '<p style="padding:40px;text-align:center;color:var(--color-muted)">No products found. Try a different search or category.</p>';
    return;
  }

  grid.innerHTML = products.map(p => {
    const hasDiscount = p.compare_price && parseFloat(p.compare_price) > parseFloat(p.price);
    const discountPct = hasDiscount ? Math.round((1 - p.price / p.compare_price) * 100) : 0;
    const inStock     = parseInt(p.stock, 10) > 0;
    const fallback    = 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80';

    return `
    <article class="product-card" data-slug="${p.slug}">
      <div class="card__img-wrap">
        <img class="card__img-primary" src="${p.primary_image || fallback}" alt="${p.name}" loading="lazy">
        <img class="card__img-hover"   src="${p.hover_image  || p.primary_image || fallback}" alt="${p.name}" loading="lazy">
        <div class="card__badges">
          ${p.featured   ? '<span class="badge badge-featured">Featured</span>' : ''}
          ${hasDiscount  ? `<span class="badge badge-sale">-${discountPct}%</span>` : ''}
          ${!inStock     ? '<span class="badge badge-outofstock">Out of Stock</span>' : ''}
        </div>
        <button class="card__quick-view" data-slug="${p.slug}" aria-label="Quick view ${p.name}">
          🔍 Quick View
        </button>
      </div>
      <div class="card__body">
        <div class="card__category">${p.category_name}</div>
        <h3 class="card__name">${p.name}</h3>
        <p class="card__desc">${p.short_description || ''}</p>
        <div class="card__price-row">
          <span class="card__price">${fmt(p.price)}</span>
          ${hasDiscount ? `<span class="card__compare-price">${fmt(p.compare_price)}</span>` : ''}
        </div>
        <div class="card__actions">
          <button class="btn btn-primary btn-sm" style="flex:1"
            data-slug="${p.slug}" data-action="add" ${!inStock ? 'disabled' : ''}>
            ${inStock ? '🛒 Add to Cart' : 'Out of Stock'}
          </button>
          <button class="card__wishlist" data-slug="${p.slug}" data-action="wishlist" title="Save for later">♡</button>
        </div>
      </div>
    </article>`;
  }).join('');

  // Bind events after render
  grid.querySelectorAll('[data-action="add"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const slug = btn.dataset.slug;
      btn.disabled = true;
      btn.textContent = '⏳ Adding…';
      try {
        await addToCart(slug, 1);
        showToast('Added to cart! 🛒', 'success');
        btn.textContent = '✅ Added!';
        setTimeout(() => { btn.disabled = false; btn.textContent = '🛒 Add to Cart'; }, 1800);
      } catch (err) {
        showToast(err.message || 'Could not add to cart', 'error');
        btn.disabled = false;
        btn.textContent = '🛒 Add to Cart';
      }
    });
  });

  grid.querySelectorAll('.card__quick-view, .product-card').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-action]')) return;
      const slug = e.currentTarget.closest('[data-slug]').dataset.slug;
      openPreview(slug);
    });
  });

  grid.querySelectorAll('[data-action="wishlist"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.textContent = btn.textContent === '♡' ? '♥' : '♡';
      showToast(btn.textContent === '♥' ? 'Added to wishlist ♥' : 'Removed from wishlist', 'info');
    });
  });
}

// ── Search ────────────────────────────────────────────────────
function bindSearch() {
  const form  = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  if (!form || !input) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchTerm = input.value.trim();
      const params = searchTerm ? { search: searchTerm } : {};
      if (activeCategory && activeCategory !== 'all') params.category = activeCategory;
      loadProducts(params);
    }, 400);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    searchTerm = input.value.trim();
    const params = searchTerm ? { search: searchTerm } : {};
    loadProducts(params);
    document.getElementById('productsSection')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ── Filter: All (inline button) ───────────────────────────────
function bindFilterAll() {
  const allBtn = document.querySelector('.filter-btn[data-cat="all"]');
  if (!allBtn) return;
  allBtn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    allBtn.classList.add('active');
    activeCategory = 'all';
    searchTerm = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    loadProducts();
  });
}

// ── Nav links ─────────────────────────────────────────────────
function bindNavLinks() {
  document.querySelectorAll('.navbar__nav a[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ── Checkout form ─────────────────────────────────────────────
function bindCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled   = true;
    submitBtn.textContent = '⏳ Placing order…';

    const data = Object.fromEntries(new FormData(form));
    try {
      const res  = await fetch('api/order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast(`🎉 Order ${json.order_number} placed! Total: ₹${json.total}`, 'success', 6000);
      form.reset();
      document.getElementById('checkoutSection')?.classList.remove('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await loadProducts();
    } catch (err) {
      showToast(err.message || 'Order failed. Please try again.', 'error');
    } finally {
      submitBtn.disabled   = false;
      submitBtn.textContent = '🛒 Place Order';
    }
  });
}

// ── Scroll top ────────────────────────────────────────────────
function bindScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Helpers ───────────────────────────────────────────────────
function fmt(amount) {
  return '₹' + parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 });
}
