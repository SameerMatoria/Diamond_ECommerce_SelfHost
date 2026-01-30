import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { apiFetch } from '../lib/api';
import { useToast } from '../components/ToastProvider';

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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
    return <p className="text-sm text-rose-600">Product not found.</p>;
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
        body: { productId: product.id, qty: 1 },
      });
      addToast('Added to cart', 'success');
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  return (
    <div className="space-y-8">
      <Link className="text-sm text-slate-600" to="/products">
        Back to products
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
        <div className="border-t border-slate-200 pt-6">
          {product.images?.[0]?.url ? (
            <img
              className="h-80 w-full object-cover"
              src={product.images[0].url}
              alt={product.title}
            />
          ) : (
            <div className="flex h-80 items-center justify-center border border-dashed border-slate-200 text-xs uppercase tracking-[0.4em] text-slate-400">
              No image
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{product.slug}</p>
            <h2 className="mt-3 text-3xl font-semibold">{product.title}</h2>
          </div>
          <p className="text-sm text-slate-600">{product.description}</p>
          <div className="border-t border-slate-200 pt-4">
            <p className="text-2xl font-semibold">
              {formatPrice(product.salePrice || product.price)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              {(product.categories || []).map((entry) => (
                <span key={entry.category.id} className="border-b border-slate-300">
                  {entry.category.name}
                </span>
              ))}
            </div>
          </div>
          <button
            className="rounded-full border border-slate-900 px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white"
            onClick={handleAddToCart}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
