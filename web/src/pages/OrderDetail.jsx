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
      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-2xl font-semibold">Order detail</h2>
        <p className="mt-2 text-sm text-slate-600">Sign in to view orders.</p>
      </div>
    );
  }

  if (status === 'loading') {
    return <p className="text-sm text-slate-500">Loading order...</p>;
  }

  if (status === 'error' || !order) {
    return <p className="text-sm text-rose-500">Order not found.</p>;
  }

  return (
    <div className="space-y-8">
      <Link className="text-sm text-slate-600" to="/orders">
        Back to orders
      </Link>
      <div className="border-t border-slate-200 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Order #{order.id.slice(0, 8)}</p>
            <p className="text-lg font-semibold">{order.status}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-lg font-semibold">{formatPrice(order.total)}</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">Items</h3>
          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-t border-slate-200 pt-3"
              >
                <div>
                  <p className="text-slate-900">{item.titleSnapshot}</p>
                  <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                </div>
                <p className="text-sm text-slate-900">{formatPrice(item.priceSnapshot)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
