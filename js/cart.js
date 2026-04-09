/**
 * Safron – cart.js
 * Full cart page: render items, update quantities, checkout redirect
 */
document.addEventListener('DOMContentLoaded', () => {
  loadCart();

  // ── Load cart ────────────────────────────────────────────────────────────
  async function loadCart() {
    showLoading(true);
    try {
      const data = await api.get('api/cart.php?action=get');
      renderCart(data);
    } catch (e) {
      document.getElementById('cartItems').innerHTML = '<p class="text-muted text-center" style="padding:40px">Failed to load cart.</p>';
    } finally {
      showLoading(false);
    }
  }

  function renderCart(data) {
    const wrap   = document.getElementById('cartItems');
    const empty  = document.getElementById('cartEmpty');
    const layout = document.getElementById('cartLayout');

    if (!data.items || !data.items.length) {
      if (empty)  empty.style.display  = 'block';
      if (layout) layout.style.display = 'none';
      return;
    }
    if (empty)  empty.style.display  = 'none';
    if (layout) layout.style.display = 'grid';

    wrap.innerHTML = data.items.map(item => `
      <div class="cart-item" id="cartItem${item.id}">
        <img class="cart-item-img" src="images/${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.svg'">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.unit_price)} each</div>
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${item.id},${item.quantity - 1})">−</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQty(${item.id},${item.quantity + 1})">+</button>
          </div>
          <a class="cart-remove" onclick="removeItem(${item.id})">Remove</a>
        </div>
        <div>
          <div class="cart-item-total">${formatPrice(item.total)}</div>
        </div>
      </div>`).join('');

    updateSummary(data);
  }

  function updateSummary(data) {
    setText('summarySubtotal', formatPrice(data.subtotal));
    setText('summaryShipping', data.shipping === 0 ? 'FREE' : formatPrice(data.shipping));
    setText('summaryTotal',    formatPrice(data.total));

    // Free shipping progress bar
    const threshold = 999;
    const progress  = Math.min(100, (data.subtotal / threshold) * 100);
    const bar = document.getElementById('shippingProgress');
    const msg = document.getElementById('shippingMsg');
    if (bar) bar.style.width = progress + '%';
    if (msg) {
      if (data.shipping === 0) {
        msg.textContent = '🎉 You have free shipping!';
        msg.style.color = '#27ae60';
      } else {
        const rem = threshold - data.subtotal;
        msg.textContent = `Add ${formatPrice(rem)} more for FREE delivery`;
      }
    }

    Cart.updateBadge();
  }

  // ── Change qty ───────────────────────────────────────────────────────────
  window.changeQty = async (cartId, newQty) => {
    try {
      await api.post('api/cart.php?action=update', { cart_id: cartId, quantity: newQty });
      loadCart();
    } catch { showToast('Update failed', 'error'); }
  };

  // ── Remove item ──────────────────────────────────────────────────────────
  window.removeItem = async (cartId) => {
    const el = document.getElementById('cartItem' + cartId);
    if (el) { el.style.opacity = '0.4'; el.style.pointerEvents = 'none'; }
    try {
      await api.post('api/cart.php?action=remove', { cart_id: cartId });
      showToast('Item removed', 'info');
      loadCart();
    } catch { showToast('Remove failed', 'error'); if (el) { el.style.opacity = '1'; el.style.pointerEvents = ''; } }
  };

  // ── Clear cart ───────────────────────────────────────────────────────────
  document.getElementById('clearCartBtn')?.addEventListener('click', async () => {
    if (!confirm('Clear all items from cart?')) return;
    await api.get('api/cart.php?action=clear');
    showToast('Cart cleared', 'info');
    loadCart();
  });

  // ── Checkout ─────────────────────────────────────────────────────────────
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    location.href = 'checkout.html';
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  function showLoading(on) {
    const sk = document.getElementById('cartSkeleton');
    const wr = document.getElementById('cartItems');
    if (sk) sk.style.display = on ? 'block' : 'none';
    if (wr) wr.style.display = on ? 'none'  : 'block';
  }
  function setText(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }
});
