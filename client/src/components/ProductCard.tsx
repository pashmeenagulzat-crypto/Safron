import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { RatingDisplay } from './ui/StarRating';
import { Badge } from './ui/Badge';
import { ProductImage } from './ui/ProductImage';
import { useCart } from '../context/CartContext';

interface Props { product: Product; showCategory?: boolean; }

export function ProductCard({ product: p, showCategory = false }: Props) {
  const { add, loading } = useCart();
  const [adding, setAdding] = useState(false);
  const effectivePrice = p.sale_price ?? p.price;

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await add(p.id);
    setAdding(false);
  }

  return (
    <Link to={`/product/${p.slug}`} className="card group block hover:shadow-gold-lg hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative bg-saffron-bg overflow-hidden">
        <ProductImage
          image={p.image}
          name={p.name}
          category={p.category_slug}
          className="w-full h-52 object-contain p-2 group-hover:scale-105 transition-transform duration-500"
          size={208}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {p.badge && <Badge text={p.badge} />}
          {p.discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{p.discount}%
            </span>
          )}
        </div>
        {p.stock <= 10 && p.stock > 0 && (
          <div className="absolute bottom-3 right-3 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">
            Only {p.stock} left
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {showCategory && (
          <p className="text-xs text-gold-600 font-semibold uppercase tracking-wider mb-1">{p.category_name}</p>
        )}
        <h3 className="font-bold text-saffron-text text-sm leading-snug mb-1 line-clamp-2 group-hover:text-gold-600 transition-colors">
          {p.name}
        </h3>
        <p className="text-xs text-saffron-muted line-clamp-2 mb-2">{p.short_description}</p>

        <div className="flex items-center gap-1.5 mb-3">
          <RatingDisplay rating={p.rating} count={p.review_count} size="sm" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-extrabold text-saffron-text">₹{effectivePrice.toLocaleString()}</span>
            {p.sale_price && (
              <span className="ml-2 text-xs text-saffron-muted line-through">₹{p.price.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || loading || p.stock === 0}
            className="btn-gold text-xs px-4 py-2"
            aria-label={`Add ${p.name} to cart`}
          >
            {adding ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : p.stock === 0 ? 'Out of stock' : '+ Cart'}
          </button>
        </div>

        {/* Origin tag */}
        <div className="mt-2 flex items-center gap-1 text-xs text-saffron-muted">
          <span>📍</span>
          <span>{p.origin}</span>
          {p.weight && <><span>·</span><span>{p.weight}</span></>}
        </div>
      </div>
    </Link>
  );
}
