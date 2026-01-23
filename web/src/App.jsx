import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Link, Navigate } from 'react-router-dom';

import { fetchHealth } from './store/healthSlice';
import { loginWithGoogle, logout, refreshSession, selectIsAdmin } from './store/authSlice';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';

function useGoogleButton(onCredential) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !buttonRef.current) {
      return undefined;
    }

    const existingScript = document.querySelector('script[data-google-identity]');
    if (existingScript) {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response.credential)
      });
      window.google?.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: 260
      });
      return undefined;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response.credential)
      });
      window.google?.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: 260
      });
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [onCredential]);

  return buttonRef;
}

function AuthPanel() {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.auth);
  const buttonRef = useGoogleButton((credential) => {
    dispatch(loginWithGoogle(credential));
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <h3 className="text-lg font-medium">Account</h3>
      {user ? (
        <div className="mt-3 space-y-2 text-slate-300">
          <p>
            Signed in as <span className="text-white">{user.name}</span>
          </p>
          <p className="text-sm text-slate-400">Role: {user.role}</p>
          <button
            className="mt-2 rounded-full border border-slate-700 px-4 py-2 text-sm hover:border-slate-500"
            onClick={() => dispatch(logout())}
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div ref={buttonRef} />
          {status === 'loading' && <p className="text-sm text-slate-400">Signing in...</p>}
          {error && <p className="text-sm text-rose-400">{error}</p>}
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <p className="text-sm text-amber-300">
              Missing VITE_GOOGLE_CLIENT_ID in web/.env
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function AdminGuard({ children }) {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = useSelector(selectIsAdmin);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-2xl font-semibold">Admin Panel</h2>
        <p className="mt-3 text-rose-300">Access denied. Admin role required.</p>
      </div>
    );
  }

  return children;
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchHealth());
    dispatch(refreshSession());
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Diamond</p>
            <h1 className="text-2xl font-semibold text-white">Electronics</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <Link className="transition hover:text-white" to="/">
              Home
            </Link>
            <Link className="transition hover:text-white" to="/products">
              Storefront
            </Link>
            <Link className="transition hover:text-white" to="/cart">
              Cart
            </Link>
            <Link className="transition hover:text-white" to="/orders">
              Orders
            </Link>
            <Link className="transition hover:text-white" to="/admin">
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[2.2fr,1fr]">
          <div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <AdminProducts />
                  </AdminGuard>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminGuard>
                    <AdminProducts />
                  </AdminGuard>
                }
              />
              <Route
                path="/admin/products/new"
                element={
                  <AdminGuard>
                    <AdminProductForm />
                  </AdminGuard>
                }
              />
              <Route
                path="/admin/products/:id/edit"
                element={
                  <AdminGuard>
                    <AdminProductForm />
                  </AdminGuard>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <AdminGuard>
                    <AdminCategories />
                  </AdminGuard>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminGuard>
                    <AdminOrders />
                  </AdminGuard>
                }
              />
            </Routes>
          </div>
          <AuthPanel />
        </div>
      </main>
    </div>
  );
}
