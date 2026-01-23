import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { apiFetch } from '../lib/api';
import { useToast } from '../components/ToastProvider';

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(Number(value));
}

export default function Cart() {
  const token = useSelector((state) => state.auth.accessToken);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [totals, setTotals] = useState({ subtotal: 0, totalItems: 0 });
  const [status, setStatus] = useState('loading');

  const loadCart = () => {
    if (!token) {
      setStatus('idle');
      return;
    }

    setStatus('loading');
    apiFetch('/api/cart', { token })
      .then((data) => {
        setCart(data.cart);
        setTotals(data.totals);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
      });
  };

  useEffect(() => {
    loadCart();
  }, [token]);

  const updateQty = async (itemId, qty) => {
    try {
      const data = await apiFetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        token,
        body: { qty }
      });
      setCart(data.cart);
      setTotals(data.totals);
      addToast('Cart updated', 'success');
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const data = await apiFetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
        token
      });
      setCart(data.cart);
      setTotals(data.totals);
      addToast('Item removed', 'success');
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  if (!token) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-2xl font-semibold">Your cart</h2>
        <p className="mt-2 text-sm text-slate-300">Sign in to manage your cart.</p>
      </div>
    );
  }

  if (status === 'loading') {
    return <p className="text-sm text-slate-400">Loading cart...</p>;
  }

  if (status === 'error') {
    return <p className="text-sm text-rose-300">Unable to load cart.</p>;
  }

  const items = cart?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cart</p>
          <h2 className="text-2xl font-semibold">Your items</h2>
        </div>
        <button
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-medium text-white"
          onClick={() => navigate('/checkout')}
          disabled={items.length === 0}
        >
          Checkout
        </button>
      </div>

      {items.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-300">Your cart is empty.</p>
          <Link className="mt-3 inline-flex text-sm text-brand-300" to="/products">
            Browse products
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <div>
                  <p className="text-white">{item.product?.title}</p>
                  <p className="text-xs text-slate-400">{item.product?.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    className="w-20 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm"
                    type="number"
                    min="1"
                    max="99"
                    value={item.qty}
                    onChange={(event) => updateQty(item.id, Number(event.target.value))}
                  />
                  <span className="text-sm text-brand-200">
                    {formatPrice(item.priceSnapshot)}
                  </span>
                  <button
                    className="text-sm text-rose-300"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-lg font-semibold">Summary</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Items</span>
                <span>{totals.totalItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
            </div>
            <button
              className="mt-4 w-full rounded-full bg-brand-500 px-5 py-3 text-sm font-medium text-white"
              onClick={() => navigate('/checkout')}
            >
              Continue to checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
