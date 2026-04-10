import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setShowSearch(false);
      setSearch('');
    }
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/products?category=saffron', label: 'Saffron' },
    { to: '/products?category=dry-fruits', label: 'Dry Fruits' },
    { to: '/products?category=honey', label: 'Honey' },
    { to: '/products?category=herbs-spices', label: 'Herbs' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      {/* Top bar */}
      <div className="bg-grad-gold text-white text-xs py-1.5 text-center hidden md:block">
        🌟 Free shipping on orders above ₹999 &nbsp;|&nbsp; 100% Pure &amp; Authentic Kashmiri Products
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">🌸</span>
          <div>
            <span className="text-xl font-extrabold text-gradient-gold tracking-tight">Safron</span>
            <p className="text-[10px] text-saffron-muted leading-none hidden sm:block">Premium Kashmiri Products</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? 'text-gold-600 bg-amber-50' : 'text-saffron-text hover:text-gold-600 hover:bg-amber-50'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button onClick={() => setShowSearch(p => !p)} className="p-2 hover:text-gold-600 transition-colors" aria-label="Search">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 hover:text-gold-600 transition-colors" aria-label={`Cart: ${count} items`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z"/></svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce-in">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-saffron-text">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={() => logout()} className="text-xs text-saffron-muted hover:text-gold-600 transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-gold hidden sm:inline-flex text-xs px-4 py-2">Login</Link>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(p => !p)} className="lg:hidden p-2 hover:text-gold-600 transition-colors" aria-label="Menu">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="bg-white border-t border-amber-100 shadow-md px-4 py-3">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <input
              type="search" autoFocus
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search saffron, kawa, shilajit…"
              className="form-input flex-1"
            />
            <button type="submit" className="btn-gold px-6 py-3">Search</button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-amber-100 shadow-lg px-4 py-4">
          <nav className="flex flex-col gap-1">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-sm font-medium rounded-xl ${isActive ? 'bg-amber-50 text-gold-600' : 'text-saffron-text'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="border-t border-amber-100 my-2" />
            {user ? (
              <button onClick={() => { logout(); setMenuOpen(false); }}
                className="text-left px-3 py-2.5 text-sm text-red-600">Logout ({user.name})</button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-gold text-sm mx-3 mt-1 justify-center">Login</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
