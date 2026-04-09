/**
 * Safron – checkout.js
 * Order form, COD / online payment, order placement
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Populate order summary sidebar
  try {
    const data = await api.get('api/cart.php?action=get');
    if (!data.items || !data.items.length) {
      showToast('Your cart is empty', 'warning');
      setTimeout(() => location.href = 'cart.html', 1000);
      return;
    }
    renderSummary(data);
  } catch (e) {
    showToast('Failed to load cart', 'error');
  }

  // Pre-fill if logged in
  if (Auth.isLoggedIn()) {
    try {
      const me = await api.get('api/auth.php?action=me');
      if (me.success && me.user) {
        prefill(me.user);
      }
    } catch {}
  }

  // Payment method toggle
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', function () {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
      this.querySelector('input[type=radio]').checked = true;
      const method = this.querySelector('input').value;
      const onlineWrap = document.getElementById('onlinePayWrap');
      if (onlineWrap) onlineWrap.style.display = method === 'online' ? 'block' : 'none';
    });
  });

  // Place order
  document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn  = form.querySelector('[type=submit]');

    const payMethod = form.querySelector('input[name=payment_method]:checked')?.value || 'cod';

    const payload = {
      name:           form.fullname.value.trim(),
      mobile:         form.mobile.value.trim(),
      email:          form.email?.value?.trim() || '',
      address:        form.address.value.trim(),
      city:           form.city.value.trim(),
      state:          form.state.value.trim(),
      pincode:        form.pincode.value.trim(),
      payment_method: payMethod,
      notes:          form.notes?.value?.trim() || '',
    };

    // Basic validation
    const required = ['name','mobile','address','city','state','pincode'];
    let ok = true;
    required.forEach(k => { if (!payload[k]) { ok = false; } });
    if (!ok) { showToast('Please fill all required fields', 'warning'); return; }
    if (!/^[6-9]\d{9}$/.test(payload.mobile)) { showToast('Enter valid mobile number', 'warning'); return; }

    btn.disabled = true;
    btn.textContent = '⏳ Placing order…';

    try {
      const data = await api.post('api/orders.php?action=place', payload);
      if (data.success) {
        sessionStorage.setItem('order_number', data.order_number);
        sessionStorage.setItem('order_total',  data.total);
        Cart.updateBadge();
        location.href = 'order-confirmation.html';
      } else {
        showToast(data.message || 'Order failed', 'error');
        btn.disabled = false;
        btn.textContent = '🛒 Place Order';
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = '🛒 Place Order';
    }
  });

  function renderSummary(data) {
    const wrap = document.getElementById('checkoutItems');
    if (wrap) {
      wrap.innerHTML = data.items.map(it => `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <img src="images/${it.image}" alt="${it.name}" style="width:52px;height:52px;border-radius:8px;object-fit:cover;background:#fdf3e3" onerror="this.src='images/placeholder.svg'">
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${it.name}</div>
            <div style="font-size:12px;color:var(--text-muted)">Qty: ${it.quantity}</div>
          </div>
          <div style="font-size:14px;font-weight:700">${formatPrice(it.total)}</div>
        </div>`).join('');
    }
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setText('cSummarySubtotal', formatPrice(data.subtotal));
    setText('cSummaryShipping', data.shipping === 0 ? 'FREE' : formatPrice(data.shipping));
    setText('cSummaryTotal',    formatPrice(data.total));
  }

  function prefill(user) {
    const f = document.getElementById('checkoutForm');
    if (!f) return;
    const set = (n, v) => { const el = f[n]; if (el && v) el.value = v; };
    set('fullname', user.name);
    set('mobile',   user.mobile);
    set('email',    user.email);
    set('address',  user.address);
    set('city',     user.city);
    set('state',    user.state);
    set('pincode',  user.pincode);
  }
});
