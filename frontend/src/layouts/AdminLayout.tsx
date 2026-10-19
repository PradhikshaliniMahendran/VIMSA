import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Layers,
  Undo2,
  ShoppingBag,
  LogOut,
  ArrowLeft,
  MessageSquare,
  Settings,
  Sparkles,
  Menu,
  X,
  Folders,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';

const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-close sidebar on mobile navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

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
    { name: 'Collections', path: '/admin/collections', icon: <Folders className="w-4 h-4 text-purple-400" /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users className="w-4 h-4" /> },
    { name: 'Returns', path: '/admin/returns', icon: <Undo2 className="w-4 h-4 text-amber-400" /> },
    { name: 'Messages', path: '/admin/messages', icon: <MessageSquare className="w-4 h-4 text-sky-400" /> },
    { name: 'Promotions', path: '/admin/promotions', icon: <Sparkles className="w-4 h-4 text-accent" /> },
    { name: 'Store Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4 text-accent" /> },
  ];

  return (
    <div className="min-h-screen flex bg-background dark:bg-dark-bg transition-colors duration-300 relative">
      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Admin Sidebar (Off-canvas drawer on mobile, static on desktop) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black text-white border-r border-accent/20 flex flex-col p-5 sm:p-6 min-h-screen transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="mb-6 lg:mb-8 flex items-center justify-between">
          <div className="flex flex-col">
            <Link to="/" className="flex items-center space-x-2 mb-1">
              <span className="font-outfit uppercase tracking-widest font-extrabold text-base text-accent">
                VIMSA ADMIN
              </span>
            </Link>
            <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold font-outfit">
              Control Console v1.0
            </span>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-900 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow flex flex-col space-y-1 font-outfit uppercase tracking-wider text-xs font-semibold overflow-y-auto pr-1">
          {adminMenu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 sm:py-3 border transition-colors rounded-sm ${
                  isActive
                    ? 'bg-accent text-black border-accent font-extrabold shadow-sm'
                    : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer shortcuts */}
        <div className="mt-6 pt-4 border-t border-neutral-900 space-y-3 shrink-0">
          <Link
            to="/"
            className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors text-xs font-outfit uppercase font-semibold py-1.5 px-1"
          >
            <ArrowLeft className="w-4 h-4 text-accent shrink-0" />
            <span>Go to Shop</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-error text-xs font-outfit uppercase font-semibold w-full text-left py-1.5 px-1 hover:opacity-80 transition-opacity"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Admin Body Content */}
      <div className="flex-grow flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Sticky Mobile/Desktop Header */}
        <header className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center shadow-xs sticky top-0 z-30">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Hamburger Toggle Button on Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-text-primary dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors focus:outline-none"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-accent" />
            </button>

            <span className="text-[11px] sm:text-xs font-outfit uppercase font-bold tracking-wider text-neutral-500 truncate">
              System Administration
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <span className="text-[10px] sm:text-xs font-outfit uppercase font-bold text-accent px-2 py-0.5 border border-accent">
              {user?.role || 'Admin'}
            </span>
            <span className="text-xs font-semibold text-text-primary dark:text-white font-outfit hidden sm:inline truncate max-w-[140px]">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </header>

        {/* Dynamic Admin View */}
        <main className="p-3 sm:p-5 lg:p-8 flex-grow overflow-y-auto w-full max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
