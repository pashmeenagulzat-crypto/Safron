/**
 * Safron – product.js
 * Product detail page: load product, gallery, qty selector, add to cart
 */
document.addEventListener('DOMContentLoaded', async () => {
  const slug = new URLSearchParams(location.search).get('slug');
  if (!slug) { location.href = 'products.html'; return; }

  try {
    const data = await api.get(`api/products.php?action=detail&slug=${encodeURIComponent(slug)}`);
    if (!data.success || !data.product) { location.href = 'products.html'; return; }
    renderProduct(data.product);
    loadReviews(data.product.id);
    loadRelated(data.product.category_slug, data.product.id);
  } catch (e) {
    document.getElementById('productWrap').innerHTML = '<p class="text-muted text-center" style="padding:60px">Failed to load product.</p>';
  }

  function renderProduct(p) {
    // Update page meta
    document.title = `${p.name} – Safron`;

    // Breadcrumb
    const bc = document.getElementById('breadcrumbProduct');
    if (bc) {
      bc.innerHTML = `
        <a href="index.html">Home</a><span>/</span>
        <a href="products.html?category=${p.category_slug}">${p.category_name}</a><span>/</span>
        <span class="current">${p.name}</span>`;
    }

    // Image
    const img = document.getElementById('productMainImg');
    if (img) {
      img.src = `images/${p.image}`;
      img.alt = p.name;
      img.onerror = () => { img.src = 'images/placeholder.svg'; };
    }

    // Badge
    if (p.discount) {
      const badge = document.getElementById('productBadge');
      if (badge) { badge.textContent = `-${p.discount}% OFF`; badge.style.display = 'block'; }
    }

    // Name & category
    setText('productCategory', p.category_name);
    setText('productName',     p.name);
    setText('productOrigin',   p.origin || '—');
    setText('productWeight',   p.weight || '—');
    setText('productSku',      p.sku    || '—');
    setText('productStock',    p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock');

    // Prices
    setText('productCurrentPrice', formatPrice(p.sale_price || p.price));
    if (p.sale_price) {
      setText('productOrigPrice',  formatPrice(p.price));
      setText('productSaving',     `Save ${formatPrice(p.price - p.sale_price)} (${p.discount}% off)`);
      show('productOrigPrice');
      show('productSaving');
    }

    // Rating
    const ratingEl = document.getElementById('productRating');
    if (ratingEl) {
      ratingEl.innerHTML = `
        <span class="stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5-Math.round(p.rating))}</span>
        <span style="font-weight:600;margin-left:4px">${p.rating}</span>
        <span class="text-muted" style="font-size:13px">(${p.review_count} reviews)</span>`;
    }

    // Description
    setText('productDescription', p.description || p.short_description || '');

    // Add to Cart
    const addBtn = document.getElementById('addToCartBtn');
    if (addBtn) {
      if (p.stock <= 0) {
        addBtn.disabled = true;
        addBtn.textContent = 'Out of Stock';
      } else {
        addBtn.addEventListener('click', () => {
          const qty = parseInt(document.getElementById('qtyInput')?.value || '1');
          Cart.add(p.id, qty, addBtn);
        });
      }
    }

    // Buy now
    document.getElementById('buyNowBtn')?.addEventListener('click', async () => {
      const qty = parseInt(document.getElementById('qtyInput')?.value || '1');
      await Cart.add(p.id, qty);
      location.href = 'cart.html';
    });

    // Qty controls
    const qtyInp = document.getElementById('qtyInput');
    document.getElementById('qtyMinus')?.addEventListener('click', () => {
      if (qtyInp && +qtyInp.value > 1) qtyInp.value = +qtyInp.value - 1;
    });
    document.getElementById('qtyPlus')?.addEventListener('click', () => {
      if (qtyInp && +qtyInp.value < p.stock) qtyInp.value = +qtyInp.value + 1;
    });
  }

  async function loadReviews(productId) {
    try {
      const data = await api.get(`api/products.php?action=reviews&product_id=${productId}`);
      const wrap = document.getElementById('reviewsList');
      if (!wrap) return;
      if (!data.reviews?.length) {
        wrap.innerHTML = '<p class="text-muted" style="padding:20px 0">No reviews yet.</p>';
        return;
      }
      wrap.innerHTML = data.reviews.map(r => `
        <div style="border-bottom:1px solid var(--border);padding:16px 0">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <div style="width:38px;height:38px;border-radius:50%;background:var(--grad-gold);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">
              ${(r.user_name||r.name||'A')[0].toUpperCase()}
            </div>
            <div>
              <div style="font-weight:700;font-size:14px">${r.user_name||r.name}</div>
              <div class="stars" style="font-size:12px">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
            </div>
          </div>
          <p style="font-size:14px;color:var(--text-light)">${r.comment||''}</p>
        </div>`).join('');
    } catch {}
  }

  async function loadRelated(categorySlug, currentId) {
    try {
      const data = await api.get(`api/products.php?action=list&category=${categorySlug}&limit=4`);
      const products = (data.products || []).filter(p => p.id !== currentId).slice(0, 4);
      const wrap = document.getElementById('relatedProducts');
      if (wrap && products.length) {
        wrap.innerHTML = products.map(buildProductCard).join('');
      }
    } catch {}
  }

  function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
  function show(id)        { const el = document.getElementById(id); if (el) el.style.display = ''; }
});
