import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { apiFetch } from '../lib/api';
import { useToast } from '../components/ToastProvider';

export default function Checkout() {
  const token = useSelector((state) => state.auth.accessToken);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
  });

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/cart', { token })
      .then((data) => setCart(data.cart))
      .catch(() => setCart(null));
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      addToast('Sign in to checkout', 'error');
      return;
    }

    try {
      await apiFetch('/api/checkout', {
        method: 'POST',
        token,
        body: {
          address: {
            fullName: form.fullName,
            phone: form.phone,
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
          shippingFee: 0,
        },
      });
      addToast('Order placed successfully', 'success');
      navigate('/products');
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  if (!token) {
    return (
      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-2xl font-semibold">Checkout</h2>
        <p className="mt-2 text-sm text-slate-600">Sign in to checkout.</p>
      </div>
    );
  }

  if (cart && cart.items?.length === 0) {
    return (
      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-2xl font-semibold">Checkout</h2>
        <p className="mt-2 text-sm text-slate-600">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-t border-slate-200 pt-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Checkout</p>
        <h2 className="text-2xl font-semibold">Delivery details</h2>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <input
          className="border-b border-slate-300 bg-transparent px-1 py-2"
          placeholder="Full name"
          value={form.fullName}
          onChange={(event) => setForm({ ...form, fullName: event.target.value })}
          required
        />
        <input
          className="border-b border-slate-300 bg-transparent px-1 py-2"
          placeholder="Phone"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          required
        />
        <input
          className="md:col-span-2 border-b border-slate-300 bg-transparent px-1 py-2"
          placeholder="Address line 1"
          value={form.line1}
          onChange={(event) => setForm({ ...form, line1: event.target.value })}
          required
        />
        <input
          className="md:col-span-2 border-b border-slate-300 bg-transparent px-1 py-2"
          placeholder="Address line 2"
          value={form.line2}
          onChange={(event) => setForm({ ...form, line2: event.target.value })}
        />
        <input
          className="border-b border-slate-300 bg-transparent px-1 py-2"
          placeholder="City"
          value={form.city}
          onChange={(event) => setForm({ ...form, city: event.target.value })}
          required
        />
        <input
          className="border-b border-slate-300 bg-transparent px-1 py-2"
          placeholder="State"
          value={form.state}
          onChange={(event) => setForm({ ...form, state: event.target.value })}
          required
        />
        <input
          className="border-b border-slate-300 bg-transparent px-1 py-2"
          placeholder="Postal code"
          value={form.postalCode}
          onChange={(event) => setForm({ ...form, postalCode: event.target.value })}
          required
        />
        <input
          className="border-b border-slate-300 bg-transparent px-1 py-2"
          placeholder="Country"
          value={form.country}
          onChange={(event) => setForm({ ...form, country: event.target.value })}
          required
        />
        <button className="md:col-span-2 rounded-full border border-slate-900 px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white">
          Place order (COD)
        </button>
      </form>
    </div>
  );
}
