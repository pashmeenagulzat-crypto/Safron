import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';

export function OrderConfirmationPage() {
  const [params] = useSearchParams();
  const orderNum = params.get('order') ?? 'SAF-XXXXXXX';
  const total    = params.get('total') ?? '0';

  useEffect(() => {
    // Launch confetti
    const end = Date.now() + 2500;
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#c8962a','#e8b84b','#ffffff'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#c8962a','#e8b84b','#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const steps = [
    { icon: '✅', label: 'Order Placed',   active: true  },
    { icon: '🔍', label: 'Confirmed',       active: false },
    { icon: '📦', label: 'Processing',      active: false },
    { icon: '🚚', label: 'Shipped',         active: false },
    { icon: '🏠', label: 'Delivered',       active: false },
  ];

  return (
    <main className="pt-24 pb-20 min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-6 text-center">
        {/* Checkmark */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-bounce-in">
          <span className="text-5xl">✅</span>
        </div>

        <h1 className="text-3xl font-extrabold text-saffron-text mb-2">Order Placed!</h1>
        <p className="text-saffron-muted text-lg mb-8">Thank you for shopping with Safron 🌸</p>

        {/* Order info */}
        <div className="card p-6 mb-8 text-left">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-saffron-muted">Order Number</p>
              <p className="font-extrabold text-saffron-text text-lg">{orderNum}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-saffron-muted">Total Paid</p>
              <p className="font-extrabold text-saffron-text text-lg">₹{parseInt(total).toLocaleString()}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 ${s.active ? 'bg-emerald-100 border-emerald-400' : 'bg-gray-50 border-gray-200'}`}>
                    {s.icon}
                  </div>
                  <span className={`text-[10px] font-medium text-center leading-tight ${s.active ? 'text-emerald-600' : 'text-saffron-muted'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${s.active ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { icon: '📧', title: 'Confirmation Email', desc: 'Check your inbox for order details' },
            { icon: '🚚', title: 'Delivery Time',      desc: '5–7 business days (standard)' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="card p-4 text-center">
              <span className="text-3xl block mb-2">{icon}</span>
              <p className="font-semibold text-saffron-text text-sm">{title}</p>
              <p className="text-xs text-saffron-muted">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-gold px-8 py-3">Back to Home</Link>
          <Link to="/products" className="btn-outline-gold px-8 py-3">Continue Shopping</Link>
        </div>
      </div>
    </main>
  );
}
