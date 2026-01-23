import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { apiFetch } from '../../lib/api';
import { useToast } from '../../components/ToastProvider';

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.accessToken);
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '0',
    status: 'DRAFT',
    categoryIds: []
  });
  const [status, setStatus] = useState('loading');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/admin/categories', { token })
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, [token]);

  useEffect(() => {
    if (!isEdit || !token) {
      setStatus('ready');
      return;
    }

    apiFetch(`/api/admin/products/${id}`, { token })
      .then((data) => {
        const product = data.product;
        setForm({
          title: product.title,
          slug: product.slug,
          description: product.description,
          price: product.price,
          salePrice: product.salePrice || '',
          stock: product.stock,
          status: product.status,
          categoryIds: product.categories?.map((entry) => entry.categoryId) || []
        });
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [id, isEdit, token]);

  const payload = useMemo(
    () => ({
      ...form,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      stock: Number(form.stock)
    }),
    [form]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isEdit) {
        await apiFetch(`/api/admin/products/${id}`, {
          method: 'PUT',
          token,
          body: payload
        });
        addToast('Product updated', 'success');
      } else {
        const response = await apiFetch('/api/admin/products', {
          method: 'POST',
          token,
          body: payload
        });
        addToast('Product created', 'success');
        navigate(`/admin/products/${response.product.id}/edit`);
      }
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    try {
      const presign = await apiFetch('/api/admin/uploads/presign', {
        method: 'POST',
        token,
        body: { filename: imageFile.name, contentType: imageFile.type }
      });

      await fetch(presign.url, {
        method: 'PUT',
        headers: { 'Content-Type': imageFile.type },
        body: imageFile
      });

      await apiFetch(`/api/admin/products/${id}/images`, {
        method: 'POST',
        token,
        body: {
          url: presign.publicUrl,
          s3Key: presign.key,
          sortOrder: 0
        }
      });

      addToast('Image uploaded', 'success');
      setImageFile(null);
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  if (status === 'error') {
    return <p className="text-sm text-rose-300">Unable to load product.</p>;
  }

  if (status === 'loading') {
    return <p className="text-sm text-slate-400">Loading product...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
        <h2 className="text-2xl font-semibold">{isEdit ? 'Edit' : 'New'} product</h2>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3"
            placeholder="Title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
          <input
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3"
            placeholder="Slug"
            value={form.slug}
            onChange={(event) => setForm({ ...form, slug: event.target.value })}
          />
        </div>
        <textarea
          className="min-h-[140px] rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3"
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          required
        />
        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3"
            placeholder="Price"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
            required
          />
          <input
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3"
            placeholder="Sale price"
            value={form.salePrice}
            onChange={(event) => setForm({ ...form, salePrice: event.target.value })}
          />
          <input
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3"
            placeholder="Stock"
            value={form.stock}
            onChange={(event) => setForm({ ...form, stock: event.target.value })}
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <select
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
          </select>
          <select
            multiple
            className="h-32 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3"
            value={form.categoryIds}
            onChange={(event) => {
              const options = Array.from(event.target.selectedOptions).map(
                (option) => option.value
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
        </div>
        <button className="rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white">
          Save product
        </button>
      </form>

      {isEdit && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-lg font-semibold">Upload image</h3>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            />
            <button
              className="rounded-full border border-slate-700 px-4 py-2 text-sm"
              onClick={handleUpload}
              type="button"
            >
              Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
