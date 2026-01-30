import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { apiFetch } from '../lib/api';

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(value));
}

export default function Orders() {
  const token = useSelector((state) => state.auth.accessToken);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) {
      setStatus('idle');
      return;
    }

    setStatus('loading');
    apiFetch('/api/orders', { token })
      .then((data) => {
        setOrders(data.items || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [token]);

  if (!token) {
    return (
      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-2xl font-semibold">Your orders</h2>
        <p className="mt-2 text-sm text-slate-600">Sign in to view orders.</p>
      </div>
    );
  }

  if (status === 'loading') {
    return <p className="text-sm text-slate-500">Loading orders...</p>;
  }

  if (status === 'error') {
    return <p className="text-sm text-rose-500">Unable to load orders.</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-2xl font-semibold">Your orders</h2>
        <p className="mt-2 text-sm text-slate-600">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-t border-slate-200 pt-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Orders</p>
        <h2 className="text-2xl font-semibold">Your orders</h2>
      </div>
      <div className="grid gap-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="border-t border-slate-200 pt-4 transition hover:border-slate-400"
          >
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
          </Link>
        ))}
      </div>
    </div>
  );
}
