import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { apiFetch } from '../../lib/api';
import { useToast } from '../../components/ToastProvider';

export default function AdminCategories() {
  const token = useSelector((state) => state.auth.accessToken);
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const loadCategories = () => {
    if (!token) return;
    apiFetch('/api/admin/categories', { token })
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  };

  useEffect(() => {
    loadCategories();
  }, [token]);

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      await apiFetch('/api/admin/categories', {
        method: 'POST',
        token,
        body: { name, slug: slug || undefined },
      });
      setName('');
      setSlug('');
      addToast('Category created', 'success');
      loadCategories();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await apiFetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        token,
      });
      addToast('Category deleted', 'success');
      loadCategories();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
        <h2 className="text-2xl font-semibold">Categories</h2>
      </div>

      <form className="grid gap-4 md:grid-cols-3" onSubmit={handleCreate}>
        <input
          className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <input
          className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          placeholder="Slug (optional)"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
        <button className="rounded-full border border-slate-900 px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white">
          Add category
        </button>
      </form>

      <div className="grid gap-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between border-t border-slate-200 pt-3"
          >
            <div>
              <div className="text-slate-900">{category.name}</div>
              <div className="text-xs text-slate-500">{category.slug}</div>
            </div>
            <button className="text-sm text-rose-500" onClick={() => handleDelete(category.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
