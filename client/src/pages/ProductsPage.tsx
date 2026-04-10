import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../utils/api';
import type { Product, Category, SortOption } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { DEMO_CATEGORIES } from '../data/products';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default',    label: 'Relevance' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'newest',     label: 'Newest' },
];

export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const categoryParam = params.get('category') ?? '';
  const searchParam   = params.get('search')   ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>(DEMO_CATEGORIES);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>('default');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const limit = 12;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchProducts({ category: categoryParam || undefined, search: searchParam || undefined, sort, page, limit });
    if (res.success) { setProducts(res.products); setTotal(res.total); }
    setLoading(false);
  }, [categoryParam, searchParam, sort, page]);

  useEffect(() => { setPage(1); }, [categoryParam, searchParam, sort]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchCategories().then(r => { if (r.success) setCats(r.categories); }); }, []);

  function setCategory(slug: string) {
    const p = new URLSearchParams(params);
    if (slug) p.set('category', slug); else p.delete('category');
    p.delete('search');
    setParams(p);
    setSidebarOpen(false);
  }

  const totalPages = Math.ceil(total / limit);
  const activeCat = cats.find(c => c.slug === categoryParam);

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-saffron-muted mb-6 flex items-center gap-1">
        <Link to="/" className="hover:text-gold-600">Home</Link>
        <span>›</span>
        <span>{activeCat?.name ?? (searchParam ? `Search: "${searchParam}"` : 'All Products')}</span>
      </nav>

      <div className="flex gap-8">
        {/* ── Sidebar ── */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white lg:bg-transparent shadow-2xl lg:shadow-none
          transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto lg:overflow-visible p-6 lg:p-0 flex-shrink-0
        `}>
          <div className="flex items-center justify-between lg:hidden mb-6">
            <h2 className="font-bold text-saffron-text">Filters</h2>
            <button onClick={() => setSidebarOpen(false)} className="text-2xl">&times;</button>
          </div>

          <div className="sticky top-24 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-2xl border border-amber-100 p-5">
              <h3 className="font-bold text-saffron-text text-sm uppercase tracking-wider mb-4">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <button onClick={() => setCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${!categoryParam ? 'bg-amber-50 text-gold-700 font-semibold' : 'text-saffron-text hover:bg-amber-50'}`}>
                    All Products <span className="text-xs text-saffron-muted ml-1">({total || cats.reduce((s, c) => s + c.product_count, 0)})</span>
                  </button>
                </li>
                {cats.map(cat => (
                  <li key={cat.id}>
                    <button onClick={() => setCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${categoryParam === cat.slug ? 'bg-amber-50 text-gold-700 font-semibold' : 'text-saffron-text hover:bg-amber-50'}`}>
                      {cat.name} <span className="text-xs text-saffron-muted ml-1">({cat.product_count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price guide */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5">
              <h3 className="font-bold text-saffron-text text-sm mb-3">💡 Did you know?</h3>
              <p className="text-xs text-saffron-muted leading-relaxed">
                Kashmiri Mongra Saffron is among the rarest spices in the world — it takes 150,000 flowers to produce just 1 kg of saffron.
              </p>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-saffron-text">
                {activeCat?.name ?? (searchParam ? `Results for "${searchParam}"` : 'All Products')}
              </h1>
              {!loading && <p className="text-sm text-saffron-muted">{total} products found</p>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-outline-gold text-sm px-4 py-2">
                ⚙️ Filters
              </button>
              <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
                className="form-input py-2 w-auto cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {loading
              ? Array(12).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.length === 0
                ? (
                  <div className="col-span-full text-center py-20">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="font-bold text-saffron-text text-xl mb-2">No products found</h3>
                    <p className="text-saffron-muted mb-6">Try a different category or search term.</p>
                    <button onClick={() => setCategory('')} className="btn-gold">View All Products</button>
                  </div>
                )
                : products.map(p => <ProductCard key={p.id} product={p} showCategory={!categoryParam} />)
            }
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-amber-200 text-sm font-medium hover:bg-amber-50 disabled:opacity-40">
                ‹ Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold ${p === page ? 'bg-gold-500 text-white' : 'border border-amber-200 hover:bg-amber-50'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-amber-200 text-sm font-medium hover:bg-amber-50 disabled:opacity-40">
                Next ›
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
