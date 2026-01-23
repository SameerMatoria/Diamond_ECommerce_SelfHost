import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { apiFetch } from '../../lib/api';

export default function AdminProducts() {
  const token = useSelector((state) => state.auth.accessToken);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) return;
    setStatus('loading');
    apiFetch('/api/admin/products', { token })
      .then((data) => {
        setProducts(data.items || []);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
          <h2 className="text-2xl font-semibold">Products</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link className="text-sm text-brand-300" to="/admin/categories">
            Manage categories
          </Link>
          <Link
            className="rounded-full bg-brand-500 px-5 py-2 text-sm font-medium text-white"
            to="/admin/products/new"
          >
            New product
          </Link>
        </div>
      </div>

      {status === 'loading' && <p className="text-sm text-slate-400">Loading products...</p>}
      {status === 'error' && (
        <p className="text-sm text-rose-300">Unable to load products.</p>
      )}

      {status === 'success' && (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/60 text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/50">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{product.title}</div>
                    <div className="text-xs text-slate-400">{product.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{product.status}</td>
                  <td className="px-4 py-3 text-slate-300">{product.stock}</td>
                  <td className="px-4 py-3 text-slate-300">{product.price}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="text-sm text-brand-300"
                      to={`/admin/products/${product.id}/edit`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
