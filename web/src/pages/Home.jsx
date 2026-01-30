import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { apiFetch } from '../lib/api';

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(value));
}

function shortSpec(text) {
  if (!text) return 'Precision-grade electronics components.';
  return text.length > 80 ? `${text.slice(0, 80)}...` : text;
}

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
    <div className="space-y-12">
      <section className="space-y-6">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Diamond Electronics</p>
        <h2 className="max-w-4xl text-5xl font-semibold leading-tight md:text-6xl">
          Components and tools for teams who ship hardware with precision.
        </h2>
        <p className="max-w-2xl text-base text-slate-600">
          Curated electronics, verified lots, and fast dispatch for labs, workshops, and makers.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Link
            className="rounded-full border border-slate-900 px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white"
            to="/products"
          >
            Shop now
          </Link>
          <Link
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            to="/support"
          >
            Talk to support
          </Link>
          <Link
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            to="/admin"
          >
            Admin
          </Link>
        </div>
      </section>

      <section className="grid gap-4 border-t border-slate-200 pt-8 md:grid-cols-3">
        {[
          { label: 'Ready stock', value: '2,000+ SKUs' },
          { label: 'Fast dispatch', value: 'Same-day on parts' },
          { label: 'Trusted by teams', value: '250+ workshops' },
        ].map((item) => (
          <div key={item.label} className="border-t border-slate-200 pt-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Featured products</h3>
          <Link className="text-sm text-slate-600" to="/products">
            View all
          </Link>
        </div>
        {productStatus === 'loading' && (
          <p className="text-sm text-slate-500">Loading products...</p>
        )}
        {productStatus === 'error' && (
          <p className="text-sm text-rose-500">Unable to load products right now.</p>
        )}
        {productStatus === 'success' && products.length === 0 && (
          <p className="text-sm text-slate-500">No products available yet.</p>
        )}
        {productStatus === 'success' && products.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group rounded-2xl border border-slate-200 p-5 transition hover:border-slate-400"
              >
                <h4 className="text-lg font-semibold group-hover:text-slate-700">
                  {product.title}
                </h4>
                <p className="mt-1 text-sm text-slate-500">{shortSpec(product.description)}</p>
                <p className="mt-3 text-sm font-medium text-slate-900">
                  {formatPrice(product.salePrice || product.price)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Top categories</h3>
          <Link className="text-sm text-slate-600" to="/products">
            View all
          </Link>
        </div>
        {status === 'loading' && <p className="text-sm text-slate-500">Loading categories...</p>}
        {status === 'error' && (
          <p className="text-sm text-rose-500">Unable to load categories right now.</p>
        )}
        {status === 'success' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <div key={category.id} className="border-t border-slate-200 pt-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{category.slug}</p>
                <h4 className="mt-2 text-lg font-semibold">{category.name}</h4>
                <p className="mt-2 text-xs text-slate-500">
                  {category._count?.products || 0} items
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 pt-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Why Diamond</p>
            <h3 className="mt-2 text-2xl font-semibold">Built for precision teams</h3>
            <p className="mt-3 text-sm text-slate-600">
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
              <div key={item} className="border-t border-slate-200 pt-3 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
