import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { apiFetch } from '../lib/api';

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(Number(value));
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
      maxPrice: searchParams.get('maxPrice') || ''
    }),
    [searchParams]
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
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Catalog</p>
          <h2 className="text-3xl font-semibold">Electronics & components</h2>
        </div>
        <div className="flex gap-2">
          <input
            className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-white"
            placeholder="Search products"
            value={query.search}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Filters
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs uppercase text-slate-500">Category</label>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  value={query.category}
                  onChange={(event) => updateFilter('category', event.target.value)}
                >
                  <option value="">All</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase text-slate-500">Min</label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    value={query.minPrice}
                    onChange={(event) => updateFilter('minPrice', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-slate-500">Max</label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    value={query.maxPrice}
                    onChange={(event) => updateFilter('maxPrice', event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          {status === 'loading' && <p className="text-sm text-slate-400">Loading products...</p>}
          {status === 'error' && (
            <p className="text-sm text-rose-300">{error || 'Unable to load products.'}</p>
          )}
          {status === 'success' && products.length === 0 && (
            <p className="text-sm text-slate-400">No products matched your filters.</p>
          )}
          {status === 'success' && products.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-brand-500"
                >
                  <div className="flex h-36 items-center justify-center rounded-xl bg-slate-950/80 text-slate-500">
                    {product.images?.[0]?.url ? (
                      <img
                        className="h-full w-full rounded-xl object-cover"
                        src={product.images[0].url}
                        alt={product.title}
                      />
                    ) : (
                      <span className="text-xs uppercase tracking-[0.4em]">No image</span>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-brand-200">
                    {product.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">{product.slug}</p>
                  <p className="mt-3 text-sm font-semibold text-brand-200">
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
