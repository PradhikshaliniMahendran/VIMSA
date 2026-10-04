import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Layers, Undo2, ShoppingBag, LogOut, ShieldAlert, ArrowLeft, MessageSquare, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';

const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const adminMenu = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'All Products', path: '/admin/products', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'Dresses', path: '/admin/products?type=DRESS', icon: <ShoppingBag className="w-4 h-4 text-pink-400" /> },
    { name: 'Home Essentials', path: '/admin/products?type=PLASTIC', icon: <ShoppingBag className="w-4 h-4 text-emerald-400" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="w-4 h-4" /> },
    { name: 'Categories', path: '/admin/categories', icon: <Layers className="w-4 h-4" /> },
    { name: 'Promotions', path: '/admin/promotions', icon: <Sparkles className="w-4 h-4 text-accent" /> },
    { name: 'Store Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4 text-accent" /> },
  ];

  return (
    <div className="min-h-screen flex bg-background dark:bg-dark-bg transition-colors duration-300">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-black text-white border-r border-accent/20 flex flex-col p-6 min-h-screen">
        <div className="mb-10 flex flex-col">
          <Link to="/" className="flex items-center space-x-2 mb-2">
            <span className="font-outfit uppercase tracking-widest font-extrabold text-base text-accent">
              VIMSA ADMIN
            </span>
          </Link>
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold font-outfit">
            Control Console v1.0
          </span>
        </div>

        <nav className="flex-grow flex flex-col space-y-1 font-outfit uppercase tracking-wider text-xs font-semibold">
          {adminMenu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 border transition-colors ${
                  isActive
                    ? 'bg-accent text-black border-accent'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-neutral-900 pt-6">
          <Link
            to="/"
            className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors text-xs font-outfit uppercase font-semibold mb-4"
          >
            <ArrowLeft className="w-4 h-4 text-accent" />
            <span>Go to Shop</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-error text-xs font-outfit uppercase font-semibold w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Admin Body Content */}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border py-4 px-8 flex justify-between items-center shadow-sm">
          <span className="text-xs font-outfit uppercase font-bold tracking-wider text-neutral-500">
            System Administration
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-outfit uppercase font-bold text-accent px-2.5 py-0.5 border border-accent">
              {user?.role}
            </span>
            <span className="text-xs font-semibold text-text-primary dark:text-white font-outfit">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </header>

        <main className="p-8 flex-grow overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
