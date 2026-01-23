import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { apiFetch } from '../lib/api';
import { useToast } from '../components/ToastProvider';

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(Number(value));
}

export default function ProductDetail() {
  const { slug } = useParams();
  const token = useSelector((state) => state.auth.accessToken);
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setStatus('loading');
    apiFetch(`/api/products/${slug}`)
      .then((data) => {
        setProduct(data.product);
        setStatus('success');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [slug]);

  if (status === 'loading') {
    return <p className="text-sm text-slate-400">Loading product...</p>;
  }

  if (status === 'error' || !product) {
    return <p className="text-sm text-rose-300">Product not found.</p>;
  }

  const handleAddToCart = async () => {
    if (!token) {
      addToast('Sign in to add items to cart', 'error');
      return;
    }
    try {
      await apiFetch('/api/cart/items', {
        method: 'POST',
        token,
        body: { productId: product.id, qty: 1 }
      });
      addToast('Added to cart', 'success');
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <Link className="text-sm text-brand-300" to="/products">
        <- Back to products
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-950/80">
            {product.images?.[0]?.url ? (
              <img
                className="h-full w-full rounded-2xl object-cover"
                src={product.images[0].url}
                alt={product.title}
              />
            ) : (
              <span className="text-xs uppercase tracking-[0.4em] text-slate-600">No image</span>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{product.slug}</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{product.title}</h2>
          </div>
          <p className="text-sm text-slate-300">{product.description}</p>
          <p className="text-2xl font-semibold text-brand-200">
            {formatPrice(product.salePrice || product.price)}
          </p>
          <div className="flex flex-wrap gap-2">
            {(product.categories || []).map((entry) => (
              <span
                key={entry.category.id}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
              >
                {entry.category.name}
              </span>
            ))}
          </div>
          <button
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white"
            onClick={handleAddToCart}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
