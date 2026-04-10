
import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-saffron-dark text-amber-100 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🌸</span>
            <span className="text-2xl font-extrabold text-gradient-gold">Safron</span>
          </div>
          <p className="text-sm text-amber-200/70 leading-relaxed mb-5">
            Bringing the pure essence of Kashmir directly to your doorstep. 100% authentic, hand-picked, and certified.
          </p>
          <div className="flex gap-3">
            {['📘', '📸', '🐦', '▶️'].map((icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-gold-500/30 flex items-center justify-center text-sm transition-colors">
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-bold text-amber-50 mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2.5 text-sm text-amber-200/70">
            {[
              ['/', 'Home'],
              ['/products', 'All Products'],
              ['/products?category=saffron', 'Saffron'],
              ['/products?category=dry-fruits', 'Dry Fruits'],
              ['/products?category=honey', 'Honey'],
              ['/products?category=herbs-spices', 'Herbs & Spices'],
            ].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-gold-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h3 className="font-bold text-amber-50 mb-4 text-sm uppercase tracking-wider">Policies</h3>
          <ul className="space-y-2.5 text-sm text-amber-200/70">
            {['Privacy Policy', 'Return & Refund Policy', 'Shipping Policy', 'Terms of Service', 'Contact Us'].map(l => (
              <li key={l}><a href="#" className="hover:text-gold-400 transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-amber-50 mb-4 text-sm uppercase tracking-wider">Contact</h3>
          <ul className="space-y-3 text-sm text-amber-200/70">
            <li className="flex gap-2"><span>📍</span> Pampore, Kashmir 192121</li>
            <li className="flex gap-2"><span>📞</span> +91-9797-123456</li>
            <li className="flex gap-2"><span>✉️</span> hello@safron.in</li>
            <li className="flex gap-2"><span>🕐</span> Mon–Sat 9 am – 6 pm IST</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-amber-200/50">
          <p>© {year} Safron. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Payments:</span>
            {['💳', '🏦', '📱', '💰'].map((i, k) => <span key={k} className="text-base">{i}</span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
