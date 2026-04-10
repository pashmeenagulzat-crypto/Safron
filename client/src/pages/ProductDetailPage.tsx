import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProduct, fetchProducts } from '../utils/api';
import type { Product } from '../types';
import { RatingDisplay, StarRating } from '../components/ui/StarRating';
import { Badge } from '../components/ui/Badge';
import { ProductImage } from '../components/ui/ProductImage';
import { ProductCard } from '../components/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useCart } from '../context/CartContext';
import { DEMO_REVIEWS } from '../data/products';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<'description' | 'reviews' | 'shipping'>('description');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProduct(slug).then(async res => {
      if (res.success && res.product) {
        setProduct(res.product);
        const rel = await fetchProducts({ category: res.product.category_slug, limit: 4 });
        if (rel.success) setRelated(rel.products.filter(p => p.slug !== slug).slice(0, 4));
      }
      setLoading(false);
    });
  }, [slug]);

  async function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    await add(product.id, qty);
    setAdded(true);
    setAdding(false);
    setTimeout(() => setAdded(false), 3000);
  }

  if (loading) return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Skeleton className="h-96 rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </main>
  );

  if (!product) return (
    <main className="pt-32 pb-20 text-center">
      <div className="text-6xl mb-4">😕</div>
      <h2 className="text-2xl font-bold text-saffron-text mb-4">Product not found</h2>
      <Link to="/products" className="btn-gold">Browse Products</Link>
    </main>
  );

  const effectivePrice = product.sale_price ?? product.price;
  const reviews = DEMO_REVIEWS[product.id] ?? [];

  return (
    <main className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-saffron-muted mb-6 flex items-center gap-1">
          <Link to="/" className="hover:text-gold-600">Home</Link>
          <span>›</span>
          <Link to={`/products?category=${product.category_slug}`} className="hover:text-gold-600">{product.category_name}</Link>
          <span>›</span>
          <span className="text-saffron-text">{product.name}</span>
        </nav>

        {/* Product details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Image */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl flex items-center justify-center p-8 min-h-80">
            <ProductImage
              image={product.image}
              name={product.name}
              category={product.category_slug}
              size={400}
              className="w-full max-w-sm"
            />
          </div>

          {/* Info */}
          <div>
            {/* Category & badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Link to={`/products?category=${product.category_slug}`}
                className="text-xs font-semibold text-gold-600 uppercase tracking-widest hover:text-gold-700">
                {product.category_name}
              </Link>
              {product.badge && <Badge text={product.badge} />}
              {product.tags?.map(t => (
                <span key={t} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">#{t}</span>
              ))}
            </div>

            <h1 className="text-3xl font-extrabold text-saffron-text leading-tight mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <RatingDisplay rating={product.rating} count={product.review_count} size="md" />
              <span className="text-xs text-saffron-muted">· SKU: {product.sku}</span>
            </div>

            <p className="text-saffron-muted leading-relaxed mb-6">{product.short_description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-extrabold text-saffron-text">₹{effectivePrice.toLocaleString()}</span>
              {product.sale_price && (
                <>
                  <span className="text-xl text-saffron-muted line-through">₹{product.price.toLocaleString()}</span>
                  <span className="bg-red-100 text-red-600 font-bold text-sm px-2.5 py-0.5 rounded-full">{product.discount}% OFF</span>
                </>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Weight', value: product.weight },
                { label: 'Origin', value: product.origin },
                { label: 'In Stock', value: product.stock > 0 ? `${product.stock} units` : 'Out of Stock' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-amber-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-saffron-muted font-medium">{label}</p>
                  <p className="text-sm font-bold text-saffron-text">{value}</p>
                </div>
              ))}
            </div>

            {/* Quantity + Add */}
            {product.stock > 0 ? (
              <div className="flex flex-wrap gap-4 items-center mb-6">
                <div className="flex items-center border-2 border-amber-200 rounded-full overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-amber-50 transition-colors">−</button>
                  <span className="w-10 text-center font-bold text-saffron-text">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-amber-50 transition-colors">+</button>
                </div>
                <button onClick={handleAddToCart} disabled={adding}
                  className={`btn-gold flex-1 min-w-[160px] py-3 text-base ${added ? 'bg-emerald-500' : ''}`}>
                  {adding ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
                </button>
                <Link to="/cart" className="btn-outline-gold py-3 px-6">Buy Now</Link>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-700 font-semibold">
                ❌ Currently Out of Stock
              </div>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {['🔒 Secure Payment', '🚚 Free Shipping ₹999+', '↩️ 7-Day Returns', '✅ Authentic Certified'].map(b => (
                <span key={b} className="text-xs text-saffron-muted bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">{b}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="flex gap-1 border-b border-amber-100 mb-6">
            {(['description', 'reviews', 'shipping'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                  tab === t ? 'border-gold-500 text-gold-600' : 'border-transparent text-saffron-muted hover:text-gold-600'
                }`}>
                {t === 'reviews' ? `Reviews (${reviews.length || product.review_count})` : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'description' && (
            <div className="prose prose-amber max-w-none text-saffron-text leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="space-y-4 max-w-2xl">
              {reviews.length > 0 ? reviews.map((r, i) => (
                <div key={i} className="card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center font-bold text-gold-700">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-saffron-text text-sm">{r.name}</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={r.rating} size="sm" />
                        <span className="text-xs text-saffron-muted">{r.date}</span>
                      </div>
                    </div>
                    <span className="ml-auto text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">✓ Verified</span>
                  </div>
                  <p className="text-sm text-saffron-muted leading-relaxed">{r.comment}</p>
                </div>
              )) : (
                <div className="text-center py-12 text-saffron-muted">
                  <div className="text-4xl mb-3">💬</div>
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          )}

          {tab === 'shipping' && (
            <div className="max-w-2xl space-y-4 text-sm text-saffron-text">
              {[
                ['🚀', 'Free Shipping', 'On all orders above ₹999 across India.'],
                ['⏱️', 'Delivery Time', 'Standard 5–7 days. Express 2–3 days (metro cities).'],
                ['↩️', 'Easy Returns', '7-day no-questions-asked return policy.'],
                ['📦', 'Packaging', 'All products are vacuum-sealed and packed in tamper-proof packaging.'],
              ].map(([icon, title, desc]) => (
                <div key={title as string} className="flex gap-4 p-4 bg-amber-50 rounded-2xl">
                  <span className="text-2xl">{icon}</span>
                  <div><p className="font-semibold mb-0.5">{title}</p><p className="text-saffron-muted">{desc}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="section-title mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
