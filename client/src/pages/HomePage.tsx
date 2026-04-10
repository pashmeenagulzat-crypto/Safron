import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../utils/api';
import type { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { DEMO_CATEGORIES } from '../data/products';

// ─── Hero Slider ─────────────────────────────────────────────────────────────
const SLIDES = [
  {
    title: 'Pure Kashmiri Saffron',
    subtitle: "Hand-picked from the heart of Pampore – experience the world's finest saffron",
    cta: 'Shop Saffron', link: '/products?category=saffron',
    emoji: '🌸', bg: 'from-[#3d1f08] to-[#7a3a0e]',
  },
  {
    title: "Nature's Finest Gifts",
    subtitle: 'Premium dry fruits, wild honey & Himalayan herbs – crafted for your wellbeing',
    cta: 'Explore Products', link: '/products',
    emoji: '🍯', bg: 'from-[#1a2a1a] to-[#2e5c1e]',
  },
  {
    title: 'The Kawa Experience',
    subtitle: 'Warm your soul with our signature Kashmiri Kawa tea infused with saffron',
    cta: 'Order Now', link: '/products?category=herbs-spices',
    emoji: '☕', bg: 'from-[#1a0e05] to-[#5c3010]',
  },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setCurrent(p => (p + 1) % SLIDES.length); setFade(true); }, 300);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[current];
  return (
    <section className={`relative min-h-[85vh] bg-gradient-to-br ${s.bg} flex items-center overflow-hidden transition-all duration-700`}>
      {/* Decorative circles */}
      {[200,300,400].map((r, i) => (
        <div key={i} className="absolute rounded-full border border-white/5" style={{ width: r, height: r, right: -r/3, bottom: -r/3 }} />
      ))}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0xMHY2aC02di02aDZ6bS0xMCAxMHY2aC02di02aDZ6bTAtMTB2NmgtNnYtNmg2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

      <div className={`max-w-7xl mx-auto px-6 py-20 transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-2xl">
          <div className="text-8xl mb-6 animate-float">{s.emoji}</div>
          <div className="inline-flex items-center gap-2 bg-white/10 text-amber-200 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/20 backdrop-blur-sm">
            ✦ Premium Kashmiri Goods — Est. 2020
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            {s.title}
          </h1>
          <p className="text-lg text-amber-100/80 leading-relaxed mb-8 max-w-xl">{s.subtitle}</p>
          <div className="flex flex-wrap gap-4">
            <Link to={s.link} className="btn-gold text-base px-8 py-4">{s.cta} →</Link>
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white/30 text-white text-base font-semibold hover:bg-white/10 transition-colors">
              View All Products
            </Link>
          </div>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => { setFade(false); setTimeout(() => { setCurrent(i); setFade(true); }, 300); }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-gold-400' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Trust Bar ────────────────────────────────────────────────────────────────
function TrustBar() {
  const items = [
    { icon: '🏅', label: 'ISO 3632 Certified Saffron' },
    { icon: '🌿', label: '100% Natural & Authentic' },
    { icon: '🚚', label: 'Free Shipping ₹999+' },
    { icon: '↩️', label: '7-Day Easy Returns' },
    { icon: '🔒', label: 'Secure Payments' },
    { icon: '⭐', label: '4.8★ Rated by 50k+ Customers' },
  ];
  return (
    <div className="bg-white border-y border-amber-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between overflow-x-auto scrollbar-hide py-3 gap-6">
          {items.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 flex-shrink-0 text-sm text-saffron-text">
              <span className="text-xl">{icon}</span>
              <span className="font-medium whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Category Grid ────────────────────────────────────────────────────────────
const CAT_EMOJIS: Record<string, string> = {
  saffron: '🌸', 'dry-fruits': '🥜', honey: '🍯', 'herbs-spices': '🌿', 'gift-sets': '🎁',
};
const CAT_COLOURS: Record<string, string> = {
  saffron:      'from-amber-100 to-amber-50 border-amber-200',
  'dry-fruits': 'from-orange-100 to-orange-50 border-orange-200',
  honey:        'from-yellow-100 to-yellow-50 border-yellow-200',
  'herbs-spices':'from-emerald-100 to-emerald-50 border-emerald-200',
  'gift-sets':  'from-pink-100 to-pink-50 border-pink-200',
};

function CategoryGrid({ cats }: { cats: Category[] }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="section-title mb-2">Shop by Category</h2>
        <p className="text-saffron-muted">Explore our curated collections of premium Kashmiri products</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cats.map(cat => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug}`}
            className={`group p-6 rounded-2xl border-2 bg-gradient-to-br ${CAT_COLOURS[cat.slug] ?? 'from-gray-100 to-gray-50 border-gray-200'} text-center hover:shadow-gold hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
              {CAT_EMOJIS[cat.slug] ?? '🛍️'}
            </div>
            <h3 className="font-bold text-saffron-text text-sm mb-1">{cat.name}</h3>
            <p className="text-xs text-saffron-muted">{cat.product_count} products</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Featured Products ────────────────────────────────────────────────────────
function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ featured: true, limit: 8 }).then(res => {
      if (res.success) setProducts(res.products);
      setLoading(false);
    });
  }, []);

  return (
    <section className="bg-amber-50/50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-1">✦ Hand-picked for you</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <Link to="/products" className="btn-outline-gold text-sm px-5 py-2">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map(p => <ProductCard key={p.id} product={p} showCategory />)
          }
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us ────────────────────────────────────────────────────────────
function WhyUs() {
  const perks = [
    { icon: '🏔️', title: 'Source Verified', desc: 'Every product sourced directly from certified farmers and artisans of Kashmir & Himalayas.' },
    { icon: '🔬', title: 'Lab Tested', desc: 'All products undergo independent lab testing for purity, potency, and safety before dispatch.' },
    { icon: '📦', title: 'Eco Packaging', desc: 'We use recyclable and biodegradable packaging to keep our environmental footprint minimal.' },
    { icon: '💬', title: '5-Star Support', desc: 'Dedicated customer care available 7 days a week, 9 AM–6 PM IST. Always here to help.' },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-2">✦ Why Safron?</p>
        <h2 className="section-title">The Safron Promise</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {perks.map(({ icon, title, desc }) => (
          <div key={title} className="card p-6 text-center hover:shadow-gold hover:-translate-y-1 transition-all duration-300">
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="font-bold text-saffron-text mb-2">{title}</h3>
            <p className="text-sm text-saffron-muted leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── All Products Strip ───────────────────────────────────────────────────────
function AllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ limit: 20 }).then(res => {
      if (res.success) setProducts(res.products);
      setLoading(false);
    });
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 pb-20">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-1">✦ Our Full Range</p>
          <h2 className="section-title">Premium Demo Products</h2>
        </div>
        <Link to="/products" className="btn-gold text-sm px-5 py-2">Browse All →</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {loading
          ? Array(10).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map(p => <ProductCard key={p.id} product={p} showCategory />)
        }
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Priya Sharma', loc: 'Mumbai', rating: 5, text: 'The Mongra saffron is absolutely unreal — deep crimson, powerful aroma, tiny bit colours a whole pot. Worth every rupee!', product: 'Kashmiri Mongra Saffron' },
  { name: 'Vikram Nair', loc: 'Bangalore', rating: 5, text: 'Kashmiri Kawa is my morning ritual now. Authentic taste, genuine saffron, and the packaging was beautiful.', product: 'Kashmiri Kawa Tea' },
  { name: 'Ayesha Khan', loc: 'Delhi', rating: 5, text: 'Ordered the Saffron Gift Box for Diwali. Recipient was completely blown away. Superb quality and presentation!', product: 'Saffron Gift Box (Luxury)' },
  { name: 'Rohit Verma', loc: 'Pune', rating: 5, text: 'Wild Forest Honey is unlike anything I\'ve tasted before. Dark, complex, and you can taste the forests of Himachal.', product: 'Wild Forest Honey' },
];

function Testimonials() {
  return (
    <section className="bg-gradient-to-br from-saffron-dark to-[#3d2010] py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-gold-400 uppercase tracking-widest mb-2">✦ Customer Love</p>
          <h2 className="text-3xl font-extrabold text-white">What Our Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map(({ name, loc, rating, text, product }) => (
            <div key={name} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex gap-0.5 mb-4">
                {Array(rating).fill('⭐').map((s, i) => <span key={i} className="text-sm">{s}</span>)}
              </div>
              <p className="text-amber-100/80 text-sm leading-relaxed mb-5">"{text}"</p>
              <div className="border-t border-white/10 pt-4">
                <p className="font-semibold text-white text-sm">{name}</p>
                <p className="text-amber-200/50 text-xs">{loc} · Verified Buyer</p>
                <p className="text-gold-400 text-xs mt-1">Bought: {product}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function HomePage() {
  const [cats, setCats] = useState<Category[]>(DEMO_CATEGORIES);

  useEffect(() => {
    fetchCategories().then(res => { if (res.success) setCats(res.categories); });
  }, []);

  return (
    <main>
      <HeroSlider />
      <TrustBar />
      <CategoryGrid cats={cats} />
      <FeaturedProducts />
      <WhyUs />
      <AllProducts />
      <Testimonials />
    </main>
  );
}
