
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ProductImage } from '../components/ui/ProductImage';

const FREE_SHIPPING_THRESHOLD = 999;

export function CartPage() {
  const { items, subtotal, shipping, total, count, update, remove, loading } = useCart();
  const navigate = useNavigate();
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  if (items.length === 0) return (
    <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-sm px-6">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-saffron-text mb-3">Your cart is empty</h2>
        <p className="text-saffron-muted mb-8">Looks like you haven't added anything yet. Start exploring our premium products!</p>
        <Link to="/products" className="btn-gold text-base px-8 py-4">Shop Now</Link>
      </div>
    </main>
  );

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-saffron-text">Shopping Cart</h1>
          <p className="text-saffron-muted">{count} item{count !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/products" className="text-sm text-gold-600 hover:text-gold-700 font-medium">← Continue Shopping</Link>
      </div>

      {/* Free shipping bar */}
      {remaining > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-amber-800 font-medium mb-2">
            🚚 Add <strong>₹{remaining.toLocaleString()}</strong> more for <strong>FREE shipping!</strong>
          </p>
          <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
            <div className="h-full bg-grad-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {remaining === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-emerald-700 font-semibold text-sm">
          🎉 You've unlocked <strong>FREE shipping!</strong>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="card p-4 sm:p-5 flex gap-4">
              <div className="w-24 h-24 flex-shrink-0 bg-saffron-bg rounded-xl overflow-hidden flex items-center justify-center">
                <ProductImage image={item.image} name={item.name} size={96} />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.slug}`} className="font-bold text-saffron-text hover:text-gold-600 transition-colors text-sm leading-snug block mb-1 line-clamp-2">
                  {item.name}
                </Link>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-extrabold text-saffron-text">₹{item.unit_price.toLocaleString()}</span>
                  {item.sale_price && (
                    <span className="text-xs text-saffron-muted line-through">₹{item.price.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  {/* Qty control */}
                  <div className="flex items-center border-2 border-amber-200 rounded-full overflow-hidden">
                    <button onClick={() => update(item.product_id, item.quantity - 1)} disabled={loading}
                      className="w-8 h-8 flex items-center justify-center hover:bg-amber-50 font-bold text-lg transition-colors">−</button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => update(item.product_id, item.quantity + 1)}
                      disabled={loading || item.quantity >= item.stock_quantity}
                      className="w-8 h-8 flex items-center justify-center hover:bg-amber-50 font-bold text-lg transition-colors">+</button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-saffron-text">₹{item.total.toLocaleString()}</span>
                    <button onClick={() => remove(item.product_id)} disabled={loading}
                      className="text-red-400 hover:text-red-600 transition-colors text-sm">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-saffron-text text-lg mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-saffron-muted">
                <span>Subtotal ({count} items)</span>
                <span className="font-medium text-saffron-text">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-saffron-muted">
                <span>Shipping</span>
                <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : 'text-saffron-text'}`}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div className="border-t border-amber-100 pt-3 flex justify-between font-extrabold text-saffron-text text-base">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-gold w-full py-4 text-base">
              Proceed to Checkout →
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-saffron-muted">
              <span>🔒</span> <span>Secure checkout powered by SSL</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
