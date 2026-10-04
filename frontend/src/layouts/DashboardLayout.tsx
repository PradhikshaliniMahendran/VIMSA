import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Bell, Gift, ShieldAlert, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.ts';

const DashboardLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Profile', path: '/dashboard', icon: <User className="w-4 h-4" /> },
    { name: 'My Orders', path: '/dashboard/orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'Addresses', path: '/dashboard/addresses', icon: <MapPin className="w-4 h-4" /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell className="w-4 h-4" /> },
    { name: 'Loyalty Points', path: '/dashboard/loyalty', icon: <Gift className="w-4 h-4" /> },
    { name: 'Security', path: '/dashboard/security', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-outfit uppercase tracking-wider text-xl md:text-2xl font-extrabold text-text-primary dark:text-white">
          My Account
        </h1>
        <p className="text-xs text-text-secondary dark:text-gray-400 mt-1.5 uppercase font-semibold font-outfit tracking-wide flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="text-accent font-bold">{t('auth.welcome_family')}</span>
          <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">|</span>
          <span>Welcome back, {user?.firstName} {user?.lastName} (Loyalty Rank: Member)</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-1 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 h-fit">
          <nav className="flex flex-col space-y-1 font-outfit uppercase tracking-wider text-xs font-semibold">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 border transition-colors ${
                    isActive
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                      : 'border-transparent text-text-primary dark:text-gray-200 hover:text-accent'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 border border-transparent text-error hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left w-full mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Content Outlet Panel */}
        <section className="lg:col-span-3 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 min-h-[50vh]">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default DashboardLayout;
