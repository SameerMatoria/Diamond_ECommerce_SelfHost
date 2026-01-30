import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { apiFetch } from '../lib/api';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [products, setProducts] = useState([]);
  const [productStatus, setProductStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    apiFetch('/api/categories')
      .then((data) => {
        if (active) {
          setCategories(data.categories || []);
          setStatus('success');
        }
      })
      .catch(() => {
        if (active) {
          setStatus('error');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch('/api/products?limit=6')
      .then((data) => {
        if (active) {
          setProducts(data.items || []);
          setProductStatus('success');
        }
      })
      .catch(() => {
        if (active) {
          setProductStatus('error');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Diamond Electronics</p>
        <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">
          Precision parts for bold builds.
        </h2>
        <p className="mt-4 max-w-2xl text-slate-300">
          Curated electronics, components, and tools for engineers, makers, and repair teams.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-brand-500/30"
            to="/products"
          >
            Browse catalog
          </Link>
          <Link
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-brand-500/30"
            to="/admin"
          >
            Admin
          </Link>
          <Link
            className="rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200"
            to="/orders"
          >
            View orders
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Ready stock', value: '2,000+ SKUs' },
          { label: 'Fast dispatch', value: 'Same-day on parts' },
          { label: 'Trusted by teams', value: '250+ workshops' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Featured products</h3>
          <Link className="text-sm text-brand-300" to="/products">
            View all
          </Link>
        </div>
        {productStatus === 'loading' && (
          <p className="text-sm text-slate-400">Loading products...</p>
        )}
        {productStatus === 'error' && (
          <p className="text-sm text-rose-300">Unable to load products right now.</p>
        )}
        {productStatus === 'success' && products.length === 0 && (
          <p className="text-sm text-slate-400">No products available yet.</p>
        )}
        {productStatus === 'success' && products.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <h4 className="mt-4 text-lg font-semibold text-white group-hover:text-brand-200">
                  {product.title}
                </h4>
                <p className="mt-1 text-sm text-slate-400">{product.slug}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Top categories</h3>
          <Link className="text-sm text-brand-300" to="/products">
            View all
          </Link>
        </div>
        {status === 'loading' && <p className="text-sm text-slate-400">Loading categories...</p>}
        {status === 'error' && (
          <p className="text-sm text-rose-300">Unable to load categories right now.</p>
        )}
        {status === 'success' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{category.slug}</p>
                <h4 className="mt-2 text-lg font-semibold text-white">{category.name}</h4>
                <p className="mt-2 text-xs text-slate-400">
                  {category._count?.products || 0} items
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Why Diamond</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Built for precision teams</h3>
            <p className="mt-3 text-sm text-slate-300">
              We source verified components, test batches, and pack orders with care so your builds
              ship on time.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'OEM-grade components',
              'Bulk pricing for labs',
              'Support for BOM sourcing',
              'Quality verified lots',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
