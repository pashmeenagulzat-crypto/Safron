/**
 * js/cart.js
 * Cart management – live cart badge, sidebar, and API integration
 */

import { showToast } from './app.js';

const FREE_SHIPPING_THRESHOLD = 999; // keep in sync with api/config.php

const sidebar        = document.getElementById('cartSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const cartBody       = document.getElementById('cartBody');
const cartBadge      = document.getElementById('cartBadge');
const cartSubtotal   = document.getElementById('cartSubtotalSide');
const cartShipping   = document.getElementById('cartShippingSide');
const cartTotal      = document.getElementById('cartTotalSide');
const shippingNote   = document.getElementById('cartShippingNote');
const checkoutBtn    = document.getElementById('goCheckoutBtn');

let cartData = { items: [], count: 0, subtotal: 0, shipping: 0, total: 0 };

// ── Public API ────────────────────────────────────────────────
export async function initCart() {
  await refreshCart();
  bindSidebarControls();
}

export async function addToCart(slug, quantity = 1) {
  const res  = await fetch('api/cart.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'add', slug, quantity }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Could not add to cart');
  updateCartState(json.cart);
  bumpBadge();
  return json.cart;
}

export async function updateCartItem(slug, quantity) {
  const res  = await fetch('api/cart.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', slug, quantity }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Could not update cart');
  updateCartState(json.cart);
  return json.cart;
}

export async function removeFromCart(slug) {
  const res  = await fetch('api/cart.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'remove', slug }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Could not remove item');
  updateCartState(json.cart);
  return json.cart;
}

export async function clearCart() {
  const res  = await fetch('api/cart.php', { method: 'DELETE' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  updateCartState(json.cart);
}

export function openCart()  { sidebar.classList.add('open'); sidebarOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
export function closeCart() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); document.body.style.overflow = ''; }
export function getCart()   { return cartData; }

// ── Internal ──────────────────────────────────────────────────
async function refreshCart() {
  try {
    const res  = await fetch('api/cart.php');
    const json = await res.json();
    if (json.success) updateCartState(json.cart);
  } catch (_) { /* silent – cart stays empty */ }
}

function updateCartState(cart) {
  cartData = cart;
  renderBadge();
  renderCartItems();
  renderTotals();
}

function renderBadge() {
  if (!cartBadge) return;
  cartBadge.textContent = cartData.count || 0;
}

function bumpBadge() {
  if (!cartBadge) return;
  cartBadge.classList.remove('bump');
  void cartBadge.offsetWidth; // reflow
  cartBadge.classList.add('bump');
  setTimeout(() => cartBadge.classList.remove('bump'), 350);
}

function renderCartItems() {
  if (!cartBody) return;

  if (!cartData.items || cartData.items.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <p>Your cart is empty.</p>
        <p class="text-muted" style="font-size:.85rem;margin-top:8px">Add some saffron products to get started!</p>
      </div>`;
    return;
  }

  const html = cartData.items.map(item => `
    <div class="cart-item" data-slug="${item.slug}">
      <div class="cart-item__img">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" loading="lazy">` : ''}
      </div>
      <div>
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">${fmt(item.price)} × ${item.quantity} = <strong>${fmt(item.line_total)}</strong></div>
        <div class="cart-item__controls">
          <div class="cart-item__qty">
            <button class="qty-dec" data-slug="${item.slug}" aria-label="Decrease">−</button>
            <span>${item.quantity}</span>
            <button class="qty-inc" data-slug="${item.slug}" data-max="${item.stock}" aria-label="Increase">+</button>
          </div>
          <button class="cart-item__remove" data-slug="${item.slug}">Remove</button>
        </div>
      </div>
    </div>`).join('');

  cartBody.innerHTML = html;

  // Bind events
  cartBody.querySelectorAll('.qty-dec').forEach(btn => {
    btn.addEventListener('click', async () => {
      const slug = btn.dataset.slug;
      const item = cartData.items.find(i => i.slug === slug);
      if (!item) return;
      if (item.quantity <= 1) {
        await removeFromCart(slug);
        showToast('Item removed from cart.', 'info');
      } else {
        await updateCartItem(slug, item.quantity - 1);
      }
    });
  });

  cartBody.querySelectorAll('.qty-inc').forEach(btn => {
    btn.addEventListener('click', async () => {
      const slug = btn.dataset.slug;
      const max  = parseInt(btn.dataset.max, 10);
      const item = cartData.items.find(i => i.slug === slug);
      if (!item) return;
      if (item.quantity >= max) {
        showToast('Max stock reached.', 'error');
        return;
      }
      await updateCartItem(slug, item.quantity + 1);
    });
  });

  cartBody.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      await removeFromCart(btn.dataset.slug);
      showToast('Item removed.', 'info');
    });
  });
}

function renderTotals() {
  const sideSubtotal = document.getElementById('cartSubtotalSide');
  const sideShipping = document.getElementById('cartShippingSide');
  const sideTotal    = document.getElementById('cartTotalSide');
  const coSubtotal   = document.getElementById('cartSubtotal');
  const coShipping   = document.getElementById('cartShipping');
  const coTotal      = document.getElementById('cartTotal');

  const subtotalText = fmt(cartData.subtotal);
  const shippingText = cartData.shipping > 0 ? fmt(cartData.shipping) : 'FREE';
  const totalText    = fmt(cartData.total);

  if (sideSubtotal) sideSubtotal.textContent = subtotalText;
  if (sideShipping) sideShipping.textContent = shippingText;
  if (sideTotal)    sideTotal.textContent    = totalText;
  if (coSubtotal)   coSubtotal.textContent   = subtotalText;
  if (coShipping)   coShipping.textContent   = shippingText;
  if (coTotal)      coTotal.textContent      = totalText;

  const noteText = cartData.shipping > 0
    ? `Add ${fmt(FREE_SHIPPING_THRESHOLD - cartData.subtotal)} more for free shipping!`
    : '🎉 You qualify for free shipping!';
  document.querySelectorAll('.cart-shipping-note').forEach(el => { el.textContent = noteText; });

  if (checkoutBtn) checkoutBtn.disabled = !cartData.items || cartData.items.length === 0;

  // Update checkout order summary
  renderOrderSummary();
}

function renderOrderSummary() {
  const wrap = document.getElementById('orderSummaryItems');
  if (!wrap) return;
  if (!cartData.items || cartData.items.length === 0) {
    wrap.innerHTML = '<p class="text-muted" style="font-size:.85rem">Add products to cart to see summary.</p>';
    return;
  }
  wrap.innerHTML = cartData.items.map(item => `
    <div class="summary-item">
      <div class="summary-item__img">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" loading="lazy">` : ''}
      </div>
      <span class="summary-item__name">${item.name} × ${item.quantity}</span>
      <span class="summary-item__price">${fmt(item.line_total)}</span>
    </div>`).join('');
}

function bindSidebarControls() {
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartSidebarClose')?.addEventListener('click', closeCart);
  sidebarOverlay?.addEventListener('click', closeCart);
  checkoutBtn?.addEventListener('click', () => {
    closeCart();
    document.getElementById('checkoutSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('checkoutSection')?.classList.add('active');
  });
}

function fmt(amount) {
  return '₹' + parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 });
}
