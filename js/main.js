/**
 * Safron – main.js
 * Shared utilities: toast notifications, cart badge, auth state, helpers
 */

// ── Toast notifications ──────────────────────────────────────────────────────
(function () {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);

  window.showToast = function (msg, type = 'success', duration = 3000) {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'slideInRight .3s ease reverse';
      setTimeout(() => el.remove(), 300);
    }, duration);
  };
})();

// ── API helper ───────────────────────────────────────────────────────────────
window.api = {
  async get(url) {
    const res = await fetch(url);
    return res.json();
  },
  async post(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

// ── Auth state ───────────────────────────────────────────────────────────────
window.Auth = {
  user: JSON.parse(localStorage.getItem('safron_user') || 'null'),

  save(user) {
    this.user = user;
    localStorage.setItem('safron_user', JSON.stringify(user));
    this.updateNav();
  },

  clear() {
    this.user = null;
    localStorage.removeItem('safron_user');
    this.updateNav();
  },

  isLoggedIn() {
    return !!this.user;
  },

  updateNav() {
    const loginBtn  = document.getElementById('navLoginBtn');
    const userWrap  = document.getElementById('navUserWrap');
    const userName  = document.getElementById('navUserName');
    if (!loginBtn) return;

    if (this.user) {
      loginBtn.classList.add('d-none');
      if (userWrap) userWrap.classList.remove('d-none');
      if (userName) userName.textContent = this.user.name.split(' ')[0];
    } else {
      loginBtn.classList.remove('d-none');
      if (userWrap) userWrap.classList.add('d-none');
    }
  },
};

// ── Cart badge ───────────────────────────────────────────────────────────────
window.Cart = {
  async updateBadge() {
    try {
      const data = await api.get('api/cart.php?action=count');
      const badge = document.getElementById('cartBadge');
      if (!badge) return;
      if (data.count > 0) {
        badge.textContent = data.count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    } catch (e) { /* offline or no DB */ }
  },

  async add(productId, qty = 1, btn = null) {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner">⏳</span> Adding…';
    }
    try {
      const data = await api.post('api/cart.php?action=add', { product_id: productId, quantity: qty });
      if (data.success) {
        showToast('Added to cart! 🛒', 'success');
        this.updateBadge();
      } else {
        showToast(data.message || 'Could not add to cart', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '🛒 Add to Cart';
      }
    }
  },
};

// ── Format currency ──────────────────────────────────────────────────────────
window.formatPrice = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

// ── Render star rating ───────────────────────────────────────────────────────
window.renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let s = '★'.repeat(full);
  if (half) s += '⭐';
  s += '☆'.repeat(5 - full - (half ? 1 : 0));
  return s;
};

// ── Product card builder ─────────────────────────────────────────────────────
window.buildProductCard = (p) => {
  const img = `images/${p.image}`;
  const price = formatPrice(p.sale_price || p.price);
  const origPrice = p.sale_price ? `<span class="price-original">${formatPrice(p.price)}</span>` : '';
  const disc = p.discount ? `<span class="price-discount">-${p.discount}%</span>` : '';
  return `
    <div class="product-card" onclick="location.href='product.html?slug=${p.slug}'">
      <div class="product-image-wrap">
        <img class="product-image" src="${img}" alt="${p.name}" onerror="this.src='images/placeholder.svg'">
        ${p.discount ? `<span class="product-badge">-${p.discount}%</span>` : ''}
        <span class="product-wishlist" title="Wishlist">♡</span>
      </div>
      <div class="product-body">
        <div class="product-category">${p.category_name}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-weight">${p.weight || ''}</div>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}</span>
          <span class="rating-count">(${p.review_count})</span>
        </div>
        <div class="product-price">
          <span class="price-current">${price}</span>
          ${origPrice}${disc}
        </div>
        <div class="product-footer">
          <button class="btn-add-cart" onclick="event.stopPropagation();Cart.add(${p.id},1,this)">
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>`;
};

// ── Init on DOMContentLoaded ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Auth.updateNav();
  Cart.updateBadge();

  // Mobile search toggle
  const searchToggle = document.getElementById('searchToggle');
  const mobileSearch = document.getElementById('mobileSearchBar');
  if (searchToggle && mobileSearch) {
    searchToggle.addEventListener('click', () => {
      mobileSearch.classList.toggle('d-none');
      if (!mobileSearch.classList.contains('d-none')) {
        mobileSearch.querySelector('input')?.focus();
      }
    });
  }

  // Global search submit
  document.querySelectorAll('.search-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = form.querySelector('input')?.value?.trim();
      if (q && q.length >= 2) {
        location.href = `products.html?q=${encodeURIComponent(q)}`;
      }
    });
  });

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await api.get('api/auth.php?action=logout');
      Auth.clear();
      showToast('Logged out successfully', 'info');
      setTimeout(() => location.href = 'index.html', 800);
    });
  }
});
