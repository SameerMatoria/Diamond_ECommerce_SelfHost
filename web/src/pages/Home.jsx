import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { apiFetch } from '../lib/api';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');

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
            className="rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200"
            to="/admin"
          >
            Admin panel
          </Link>
        </div>
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
    </div>
  );
}
