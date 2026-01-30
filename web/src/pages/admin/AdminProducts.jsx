import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { apiFetch } from '../../lib/api';
import { useToast } from '../../components/ToastProvider';

export default function AdminProducts() {
  const token = useSelector((state) => state.auth.accessToken);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '0',
    status: 'DRAFT',
    categoryIds: [],
  });
  const [creating, setCreating] = useState(false);

  const loadProducts = () => {
    if (!token) return;
    setStatus('loading');
    apiFetch('/api/admin/products', { token })
      .then((data) => {
        setProducts(data.items || []);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    if (!token) return;
    loadProducts();
    apiFetch('/api/admin/categories', { token })
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, [token]);

  const payload = useMemo(
    () => ({
      title: form.title,
      slug: form.slug || undefined,
      description: form.description,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      stock: Number(form.stock),
      status: form.status,
      categoryIds: form.categoryIds,
    }),
    [form],
  );

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!token) return;
    setCreating(true);
    try {
      const response = await apiFetch('/api/admin/products', {
        method: 'POST',
        token,
        body: payload,
      });
      addToast('Product created', 'success');
      setForm({
        title: '',
        slug: '',
        description: '',
        price: '',
        salePrice: '',
        stock: '0',
        status: 'DRAFT',
        categoryIds: [],
      });
      loadProducts();
      navigate(`/admin/products/${response.product.id}/edit`);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
          <h2 className="text-2xl font-semibold">Products</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link className="text-sm text-brand-300" to="/admin/categories">
            Manage categories
          </Link>
          <Link className="text-sm text-brand-300" to="/admin/orders">
            Manage orders
          </Link>
          <Link className="text-sm text-brand-300" to="/admin/users">
            Manage users
          </Link>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Create product</p>
            <h3 className="text-xl font-semibold text-white">Add a new product</h3>
            <p className="mt-2 text-sm text-slate-300">
              Fill every field below. Titles and descriptions appear on storefront. Images are added
              after save.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-300">
            <p className="uppercase tracking-[0.3em] text-slate-400">Tips</p>
            <p className="mt-2">Set status to ACTIVE to show on storefront.</p>
            <p className="mt-1">Use clear SKU-like titles for search.</p>
          </div>
        </div>

        <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={handleCreate}>
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">Product title</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3"
              placeholder="Eg. 12V 2A Adapter"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">Slug (optional)</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3"
              placeholder="auto-generated if empty"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs uppercase text-slate-400">Description</label>
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3"
              placeholder="What is the product, specs, usage, warranty info, etc."
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">Price (₹)</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3"
              placeholder="e.g. 499"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">Sale price (optional)</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3"
              placeholder="e.g. 449"
              value={form.salePrice}
              onChange={(event) => setForm({ ...form, salePrice: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">Stock quantity</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3"
              placeholder="e.g. 100"
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">Status</label>
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              <option value="DRAFT">Draft (hidden)</option>
              <option value="ACTIVE">Active (visible)</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs uppercase text-slate-400">Categories</label>
            <select
              multiple
              className="h-36 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3"
              value={form.categoryIds}
              onChange={(event) => {
                const options = Array.from(event.target.selectedOptions).map(
                  (option) => option.value,
                );
                setForm({ ...form, categoryIds: options });
              }}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400">
              Add categories first in Manage categories, then select them here.
            </p>
          </div>
          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              After saving, open the product to upload images.
            </p>
            <button
              className="rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white"
              type="submit"
              disabled={creating}
            >
              {creating ? 'Saving...' : 'Save product'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Catalog</p>
            <h3 className="text-xl font-semibold text-white">All products</h3>
          </div>
        </div>

        {status === 'loading' && <p className="text-sm text-slate-400">Loading products...</p>}
        {status === 'error' && <p className="text-sm text-rose-300">Unable to load products.</p>}

        {status === 'success' && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
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
                        Edit + images
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
