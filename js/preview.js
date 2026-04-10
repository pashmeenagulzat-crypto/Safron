/**
 * js/preview.js
 * Live Product Preview – Quick View Modal with image gallery, zoom, and cart integration
 */

import { addToCart } from './cart.js';
import { showToast }  from './app.js';

const overlay   = document.getElementById('previewOverlay');
const modal     = document.getElementById('previewModal');
const closeBtn  = document.getElementById('previewClose');
const mainImg   = document.getElementById('previewMainImg');
const thumbsWrap = document.getElementById('previewThumbs');
const zoomHint  = document.getElementById('zoomHint');
const categoryEl = document.getElementById('previewCategory');
const nameEl    = document.getElementById('previewName');
const priceEl   = document.getElementById('previewPrice');
const compareEl = document.getElementById('previewCompare');
const saveEl    = document.getElementById('previewSave');
const descEl    = document.getElementById('previewDesc');
const gradeEl   = document.getElementById('previewGrade');
const originEl  = document.getElementById('previewOrigin');
const weightEl  = document.getElementById('previewWeight');
const stockEl   = document.getElementById('previewStock');
const addBtn    = document.getElementById('previewAddBtn');
const qtyInput  = document.getElementById('previewQty');
const qtyMinus  = document.getElementById('previewQtyMinus');
const qtyPlus   = document.getElementById('previewQtyPlus');

let currentProduct = null;
let currentImages  = [];
let activeImgIdx   = 0;

// ── Open modal ──────────────────────────────────────────────────
export async function openPreview(slug) {
  resetModal();
  showOverlay();

  try {
    const res  = await fetch(`api/products.php?action=get&slug=${encodeURIComponent(slug)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load product');
    populateModal(json.data);
  } catch (err) {
    showToast('Could not load product details.', 'error');
    closePreview();
  }
}

// ── Populate modal with product data ───────────────────────────
function populateModal(product) {
  currentProduct = product;
  currentImages  = product.images || [];
  activeImgIdx   = 0;

  categoryEl.textContent = product.category_name || '';
  nameEl.textContent     = product.name;
  priceEl.textContent    = formatCurrency(product.price);
  descEl.textContent     = product.description || product.short_description || '';
  gradeEl.textContent    = product.grade || '—';
  originEl.textContent   = product.origin || 'Kashmir, India';
  weightEl.textContent   = product.weight_grams ? `${product.weight_grams}g` : '—';

  const inStock = parseInt(product.stock, 10) > 0;
  stockEl.textContent    = inStock ? `In Stock (${product.stock} left)` : 'Out of Stock';
  stockEl.style.color    = inStock ? 'var(--color-success)' : 'var(--color-error)';
  addBtn.disabled        = !inStock;
  qtyInput.max           = product.stock;

  if (product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price)) {
    compareEl.textContent = formatCurrency(product.compare_price);
    compareEl.style.display = 'inline';
    const savePct = Math.round((1 - product.price / product.compare_price) * 100);
    saveEl.textContent  = `${savePct}% off`;
    saveEl.style.display = 'inline';
  } else {
    compareEl.style.display = 'none';
    saveEl.style.display    = 'none';
  }

  // Gallery
  buildGallery();
}

function buildGallery() {
  thumbsWrap.innerHTML = '';
  const fallback = 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80';

  if (currentImages.length === 0) {
    mainImg.src = fallback;
    mainImg.alt = currentProduct.name;
    return;
  }

  currentImages.forEach((img, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'modal__thumb' + (idx === 0 ? ' active' : '');
    thumb.innerHTML = `<img src="${img.image_url}" alt="${img.alt_text || currentProduct.name}" loading="lazy">`;
    thumb.addEventListener('click', () => switchImage(idx));
    thumbsWrap.appendChild(thumb);
  });

  switchImage(0);
}

function switchImage(idx) {
  activeImgIdx = idx;
  const img = currentImages[idx];
  mainImg.src = img.image_url;
  mainImg.alt = img.alt_text || currentProduct.name;

  document.querySelectorAll('.modal__thumb').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
}

// ── Zoom: follow mouse for precision zoom ──────────────────────
mainImg?.parentElement?.addEventListener('mousemove', (e) => {
  const rect = mainImg.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(2);
  const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(2);
  mainImg.style.transformOrigin = `${x}% ${y}%`;
});
mainImg?.parentElement?.addEventListener('mouseleave', () => {
  mainImg.style.transformOrigin = 'center center';
});

// ── Qty stepper ───────────────────────────────────────────────
qtyMinus?.addEventListener('click', () => {
  const v = parseInt(qtyInput.value, 10);
  if (v > 1) qtyInput.value = v - 1;
});
qtyPlus?.addEventListener('click', () => {
  const v   = parseInt(qtyInput.value, 10);
  const max = parseInt(qtyInput.max, 10) || 99;
  if (v < max) qtyInput.value = v + 1;
});

// ── Add to cart ───────────────────────────────────────────────
addBtn?.addEventListener('click', async () => {
  if (!currentProduct) return;
  const qty = parseInt(qtyInput.value, 10) || 1;
  addBtn.disabled = true;
  addBtn.innerHTML = '⏳ Adding…';
  try {
    await addToCart(currentProduct.slug, qty);
    showToast(`${currentProduct.name} added to cart! 🛒`, 'success');
    closePreview();
  } catch (err) {
    showToast(err.message || 'Could not add to cart', 'error');
    addBtn.disabled = false;
    addBtn.innerHTML = '🛒 Add to Cart';
  }
});

// ── Show / hide overlay ───────────────────────────────────────
function showOverlay() {
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closePreview() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function resetModal() {
  currentProduct = null;
  currentImages  = [];
  mainImg.src    = '';
  thumbsWrap.innerHTML = '';
  nameEl.textContent   = '';
  descEl.textContent   = '';
  qtyInput.value       = 1;
  addBtn.disabled      = false;
  addBtn.innerHTML     = '🛒 Add to Cart';
}

closeBtn?.addEventListener('click', closePreview);
overlay?.addEventListener('click', (e) => {
  if (e.target === overlay) closePreview();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closePreview();
  if (e.key === 'ArrowLeft'  && overlay.classList.contains('open')) switchImage(Math.max(0, activeImgIdx - 1));
  if (e.key === 'ArrowRight' && overlay.classList.contains('open')) switchImage(Math.min(currentImages.length - 1, activeImgIdx + 1));
});

// ── Helper ────────────────────────────────────────────────────
function formatCurrency(amount) {
  return '₹' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0 });
}
