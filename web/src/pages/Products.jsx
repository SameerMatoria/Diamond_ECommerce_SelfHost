import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { apiFetch } from '../lib/api';

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(value));
}

function shortSpec(text) {
  if (!text) return 'Precision-grade component, workshop-ready.';
  return text.length > 80 ? `${text.slice(0, 80)}...` : text;
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const query = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
    }),
    [searchParams],
  );

  useEffect(() => {
    apiFetch('/api/categories')
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setStatus('loading');
    setError(null);

    const params = new URLSearchParams();
    if (query.search) params.set('search', query.search);
    if (query.category) params.set('category', query.category);
    if (query.minPrice) params.set('minPrice', query.minPrice);
    if (query.maxPrice) params.set('maxPrice', query.maxPrice);

    apiFetch(`/api/products?${params.toString()}`)
      .then((data) => {
        setProducts(data.items || []);
        setStatus('success');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, [query]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Shop</p>
        <h2 className="text-4xl font-semibold">Editorial catalog</h2>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <p className="max-w-xl text-sm text-slate-600">
            Browse components curated for clean builds, fast repairs, and reliable sourcing.
          </p>
          <input
            className="w-full max-w-xs border-b border-slate-300 bg-transparent px-1 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
            placeholder="Search products"
            value={query.search}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[240px,1fr]">
        <aside className="space-y-8">
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400">Categories</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <button
                className={`block text-left transition ${
                  query.category ? 'text-slate-500' : 'text-slate-900'
                }`}
                onClick={() => updateFilter('category', '')}
                type="button"
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`block text-left transition ${
                    query.category === category.slug ? 'text-slate-900' : 'text-slate-500'
                  }`}
                  onClick={() => updateFilter('category', category.slug)}
                  type="button"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400">Price</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
              <input
                className="border-b border-slate-300 bg-transparent px-1 py-2 outline-none"
                placeholder="Min"
                value={query.minPrice}
                onChange={(event) => updateFilter('minPrice', event.target.value)}
              />
              <input
                className="border-b border-slate-300 bg-transparent px-1 py-2 outline-none"
                placeholder="Max"
                value={query.maxPrice}
                onChange={(event) => updateFilter('maxPrice', event.target.value)}
              />
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          {status === 'loading' && <p className="text-sm text-slate-500">Loading products...</p>}
          {status === 'error' && (
            <p className="text-sm text-rose-500">{error || 'Unable to load products.'}</p>
          )}
          {status === 'success' && products.length === 0 && (
            <p className="text-sm text-slate-500">No products matched your filters.</p>
          )}
          {status === 'success' && products.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-400"
                >
                  <h3 className="text-lg font-semibold">{product.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{shortSpec(product.description)}</p>
                  <p className="mt-3 text-sm font-medium text-slate-900">
                    {formatPrice(product.salePrice || product.price)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
