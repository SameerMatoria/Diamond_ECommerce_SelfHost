import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { apiFetch } from '../../lib/api';
import { useToast } from '../../components/ToastProvider';

const roleOptions = ['USER', 'ADMIN'];

export default function AdminUsers() {
  const token = useSelector((state) => state.auth.accessToken);
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [search, setSearch] = useState('');

  const loadUsers = () => {
    if (!token) return;
    setStatus('loading');
    const params = new URLSearchParams();
    if (search) params.set('search', search);

    apiFetch(`/api/admin/users?${params.toString()}`, { token })
      .then((data) => {
        setUsers(data.items || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  const handleRoleChange = async (userId, role) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        token,
        body: { role },
      });
      addToast('Role updated', 'success');
      loadUsers();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  if (status === 'loading') {
    return <p className="text-sm text-slate-400">Loading users...</p>;
  }

  if (status === 'error') {
    return <p className="text-sm text-rose-300">Unable to load users.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
          <h2 className="text-2xl font-semibold">Users</h2>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm"
            placeholder="Search users"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button
            className="rounded-full border border-slate-700 px-4 py-2 text-sm"
            onClick={loadUsers}
          >
            Search
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/60 text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/50">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-slate-200">{user.name}</td>
                <td className="px-4 py-3 text-slate-300">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                    value={user.role}
                    onChange={(event) => handleRoleChange(user.id, event.target.value)}
                  >
                    {roleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(user.createdAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
