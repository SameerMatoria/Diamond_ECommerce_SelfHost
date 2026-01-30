import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { apiFetch } from '../../lib/api';
import { useToast } from '../../components/ToastProvider';

const statusOptions = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const paymentOptions = ['UNPAID', 'PAID', 'REFUNDED'];

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(value));
}

export default function AdminOrders() {
  const token = useSelector((state) => state.auth.accessToken);
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');

  const loadOrders = () => {
    if (!token) return;
    setStatus('loading');
    apiFetch('/api/admin/orders', { token })
      .then((data) => {
        setOrders(data.items || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const updateStatus = async (orderId, nextStatus) => {
    try {
      await apiFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        token,
        body: { status: nextStatus },
      });
      addToast('Order status updated', 'success');
      loadOrders();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const updatePayment = async (orderId, nextStatus) => {
    try {
      await apiFetch(`/api/admin/orders/${orderId}/payment-status`, {
        method: 'PUT',
        token,
        body: { paymentStatus: nextStatus },
      });
      addToast('Payment status updated', 'success');
      loadOrders();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  if (status === 'loading') {
    return <p className="text-sm text-slate-500">Loading orders...</p>;
  }

  if (status === 'error') {
    return <p className="text-sm text-rose-500">Unable to load orders.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
        <h2 className="text-2xl font-semibold">Orders</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">#{order.id.slice(0, 8)}</div>
                  <div className="text-xs text-slate-500">{order.createdAt}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{order.user?.email}</td>
                <td className="px-4 py-3 text-slate-600">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700"
                    value={order.status}
                    onChange={(event) => updateStatus(order.id, event.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700"
                    value={order.paymentStatus}
                    onChange={(event) => updatePayment(order.id, event.target.value)}
                  >
                    {paymentOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
