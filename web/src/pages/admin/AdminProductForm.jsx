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
    categoryIds: [],
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
          categoryIds: product.categories?.map((entry) => entry.categoryId) || [],
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
      stock: Number(form.stock),
    }),
    [form],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isEdit) {
        await apiFetch(`/api/admin/products/${id}`, {
          method: 'PUT',
          token,
          body: payload,
        });
        addToast('Product updated', 'success');
      } else {
        const response = await apiFetch('/api/admin/products', {
          method: 'POST',
          token,
          body: payload,
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
        body: { filename: imageFile.name, contentType: imageFile.type },
      });

      await fetch(presign.url, {
        method: 'PUT',
        headers: { 'Content-Type': imageFile.type },
        body: imageFile,
      });

      await apiFetch(`/api/admin/products/${id}/images`, {
        method: 'POST',
        token,
        body: {
          url: presign.publicUrl,
          s3Key: presign.key,
          sortOrder: 0,
        },
      });

      addToast('Image uploaded', 'success');
      setImageFile(null);
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  if (status === 'error') {
    return <p className="text-sm text-rose-500">Unable to load product.</p>;
  }

  if (status === 'loading') {
    return <p className="text-sm text-slate-500">Loading product...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
          <h2 className="text-2xl font-semibold">{isEdit ? 'Edit' : 'New'} product</h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
          <p className="uppercase tracking-[0.3em] text-slate-400">Guide</p>
          <p className="mt-2">Make sure status is ACTIVE to show on storefront.</p>
          <p className="mt-1">Images can be uploaded after saving.</p>
        </div>
      </div>

      <form className="rounded-3xl border border-slate-200 bg-white p-6" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">Product title</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              placeholder="Eg. 12V 2A Adapter"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">Slug (optional)</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              placeholder="auto-generated if empty"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs uppercase text-slate-400">Description</label>
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              placeholder="Explain specs, usage, warranty, etc."
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">Price (INR)</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              placeholder="e.g. 499"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">Sale price (optional)</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              placeholder="e.g. 449"
              value={form.salePrice}
              onChange={(event) => setForm({ ...form, salePrice: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">Stock quantity</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              placeholder="e.g. 100"
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">Status</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
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
              className="h-36 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
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
            <p className="text-xs text-slate-500">Add categories first, then select them here.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Save changes before uploading images.</p>
          <button className="rounded-full border border-slate-900 px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white">
            Save product
          </button>
        </div>
      </form>

      {isEdit && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Product images</p>
              <h3 className="text-xl font-semibold">Upload product photos</h3>
              <p className="mt-2 text-sm text-slate-600">
                Upload a clear product shot. The first image appears on listings.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
              <p className="uppercase tracking-[0.3em] text-slate-400">Requirements</p>
              <p className="mt-2">JPG/PNG, under 2MB.</p>
              <p className="mt-1">Use square images for best results.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            />
            <button
              className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-500"
              onClick={handleUpload}
              type="button"
            >
              Upload image
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
