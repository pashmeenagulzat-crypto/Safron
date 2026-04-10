import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../utils/api';
import type { CheckoutFormData } from '../types';
import { isValidIndianMobile, isValidPincode } from '../utils/validation';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

export function CheckoutPage() {
  const { items, subtotal, shipping, total, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<CheckoutFormData>({
    name:           user?.name    ?? '',
    mobile:         user?.mobile  ?? '',
    email:          user?.email   ?? '',
    address:        user?.address ?? '',
    city:           user?.city    ?? '',
    state:          user?.state   ?? '',
    pincode:        user?.pincode ?? '',
    payment_method: 'cod',
    notes:          '',
  });

  if (items.length === 0) return (
    <main className="pt-32 pb-20 text-center">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold text-saffron-text mb-4">Your cart is empty</h2>
      <Link to="/products" className="btn-gold">Shop Now</Link>
    </main>
  );

  function setField(key: keyof CheckoutFormData, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!isValidIndianMobile(form.mobile)) { setError('Enter a valid 10-digit Indian mobile number'); return; }
    if (!form.address.trim()) { setError('Address is required'); return; }
    if (!form.city.trim()) { setError('City is required'); return; }
    if (!form.state) { setError('State is required'); return; }
    if (!isValidPincode(form.pincode)) { setError('Enter a valid 6-digit pincode'); return; }

    setLoading(true);
    const res = await placeOrder(form);
    setLoading(false);
    if (res.success && res.order_number) {
      navigate(`/order-confirmation?order=${res.order_number}&total=${res.total ?? total}`);
    } else {
      setError(res.message ?? 'Failed to place order. Please try again.');
    }
  }

  const InputRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold text-saffron-text mb-1.5">{label}</label>
      {children}
    </div>
  );

  return (
    <main className="pt-24 pb-20 max-w-6xl mx-auto px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-saffron-text">Checkout</h1>
        <p className="text-saffron-muted">{count} item{count !== 1 ? 's' : ''} in your order</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Delivery form – 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          {/* Delivery address */}
          <div className="card p-6">
            <h2 className="font-bold text-saffron-text text-base mb-5 flex items-center gap-2">📍 Delivery Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputRow label="Full Name *">
                <input value={form.name} onChange={e => setField('name', e.target.value)} required className="form-input" placeholder="Your full name" />
              </InputRow>
              <InputRow label="Mobile Number *">
                <input value={form.mobile} onChange={e => setField('mobile', e.target.value)} required className="form-input" placeholder="10-digit mobile" maxLength={10} />
              </InputRow>
              <InputRow label="Email Address">
                <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} className="form-input" placeholder="your@email.com" />
              </InputRow>
              <InputRow label="Pincode *">
                <input value={form.pincode} onChange={e => setField('pincode', e.target.value)} required className="form-input" placeholder="6-digit pincode" maxLength={6} />
              </InputRow>
              <div className="sm:col-span-2">
                <InputRow label="Full Address *">
                  <textarea value={form.address} onChange={e => setField('address', e.target.value)} required className="form-input resize-none" rows={3} placeholder="House/Flat no., Street, Locality" />
                </InputRow>
              </div>
              <InputRow label="City *">
                <input value={form.city} onChange={e => setField('city', e.target.value)} required className="form-input" placeholder="City" />
              </InputRow>
              <InputRow label="State *">
                <select value={form.state} onChange={e => setField('state', e.target.value)} required className="form-input">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </InputRow>
              <div className="sm:col-span-2">
                <InputRow label="Order Notes (optional)">
                  <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} className="form-input resize-none" rows={2} placeholder="Any special instructions…" />
                </InputRow>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="font-bold text-saffron-text text-base mb-5 flex items-center gap-2">💳 Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { value: 'cod',    label: 'Cash on Delivery', icon: '💵', desc: 'Pay when order arrives' },
                { value: 'online', label: 'Online Payment',   icon: '💳', desc: 'UPI, Card, Net Banking' },
              ] as const).map(({ value, label, icon, desc }) => (
                <label key={value}
                  className={`flex items-start gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    form.payment_method === value ? 'border-gold-500 bg-amber-50' : 'border-amber-100 hover:border-amber-300'
                  }`}>
                  <input type="radio" name="payment" value={value} checked={form.payment_method === value}
                    onChange={() => setField('payment_method', value)} className="mt-0.5 accent-amber-500" />
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-saffron-text text-sm">
                      <span>{icon}</span> {label}
                    </div>
                    <p className="text-xs text-saffron-muted mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {form.payment_method === 'online' && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                ℹ️ You'll be redirected to our secure payment gateway after confirming the order.
              </div>
            )}
          </div>
        </div>

        {/* Order summary – 2 cols */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-saffron-text text-base mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <span className="text-2xl">🌿</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-saffron-text line-clamp-1">{item.name}</p>
                    <p className="text-xs text-saffron-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-saffron-text">₹{item.total.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-amber-100 pt-4 space-y-2.5 text-sm mb-5">
              <div className="flex justify-between text-saffron-muted">
                <span>Subtotal</span>
                <span className="font-medium text-saffron-text">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-saffron-muted">
                <span>Shipping</span>
                <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : 'text-saffron-text'}`}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div className="border-t border-amber-100 pt-2.5 flex justify-between font-extrabold text-saffron-text text-base">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full py-4 text-base">
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing Order…</>
              ) : `Place Order · ₹${total.toLocaleString()}`}
            </button>

            <p className="mt-3 text-center text-xs text-saffron-muted">
              🔒 Your data is encrypted & secure
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}
