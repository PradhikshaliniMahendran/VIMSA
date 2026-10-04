import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.tsx';
import Footer from '../components/layout/Footer.tsx';
import CartDrawer from '../components/layout/CartDrawer.tsx';
import SearchBar from '../components/SearchBar.tsx';
import WhatsAppButton from '../components/WhatsAppButton.tsx';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg text-text-primary dark:text-white transition-colors duration-300">
      {/* Search Bar Overlay */}
      <SearchBar />

      {/* Shopping Cart Sliding Drawer */}
      <CartDrawer />

      {/* Main Navbar Navigation */}
      <Navbar />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppButton />

      {/* Main Page Content Outlet */}
      <main className="flex-grow pt-16 md:pt-20">
        <Outlet />
      </main>

      {/* Main Footer Block */}
      <Footer />
    </div>
  );
};

export default MainLayout;
