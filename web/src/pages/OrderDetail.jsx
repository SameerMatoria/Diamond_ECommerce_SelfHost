import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { apiFetch } from '../lib/api';

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(value));
}

export default function OrderDetail() {
  const { id } = useParams();
  const token = useSelector((state) => state.auth.accessToken);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) {
      setStatus('idle');
      return;
    }

    setStatus('loading');
    apiFetch(`/api/orders/${id}`, { token })
      .then((data) => {
        setOrder(data.order);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [id, token]);

  if (!token) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-2xl font-semibold">Order detail</h2>
        <p className="mt-2 text-sm text-slate-300">Sign in to view orders.</p>
      </div>
    );
  }

  if (status === 'loading') {
    return <p className="text-sm text-slate-400">Loading order...</p>;
  }

  if (status === 'error' || !order) {
    return <p className="text-sm text-rose-300">Order not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Link className="text-sm text-brand-300" to="/orders">
        Back to orders
      </Link>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Order #{order.id.slice(0, 8)}</p>
            <p className="text-lg font-semibold text-white">{order.status}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Total</p>
            <p className="text-lg font-semibold text-brand-200">{formatPrice(order.total)}</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">Items</h3>
          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3"
              >
                <div>
                  <p className="text-white">{item.titleSnapshot}</p>
                  <p className="text-xs text-slate-400">Qty: {item.qty}</p>
                </div>
                <p className="text-sm text-brand-200">{formatPrice(item.priceSnapshot)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
