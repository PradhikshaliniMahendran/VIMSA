import React, { useEffect, useState } from 'react';
import { ShoppingBag, Package, Sparkles, Layers, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService.ts';
import { ProductType } from '../../components/ui/ProductCard.tsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';
import Button from '../../components/ui/Button.tsx';
import { useCart } from '../../hooks/useCart.ts';

const AdminDashboard: React.FC = () => {
  const { formatPrice } = useCart();
  const [totalProducts, setTotalProducts] = useState(0);
  const [dressesCount, setDressesCount] = useState(0);
  const [plasticCount, setPlasticCount] = useState(0);
  const [newArrivalsCount, setNewArrivalsCount] = useState(0);
  const [recentProducts, setRecentProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      setLoading(true);
      try {
        const [allRes, dressRes, plasticRes, newRes] = await Promise.all([
          productService.getAdminProducts({ limit: 10 }),
          productService.getAdminProducts({ productType: 'DRESS', limit: 1 }),
          productService.getAdminProducts({ productType: 'PLASTIC', limit: 1 }),
          productService.getProducts({ isNewArrival: 'true', limit: 1 }),
        ]);

        if (allRes.success && allRes.data) {
          setTotalProducts(allRes.data.total || 0);
          setRecentProducts(allRes.data.products || []);
        }
        if (dressRes.success && dressRes.data) {
          setDressesCount(dressRes.data.total || 0);
        }
        if (plasticRes.success && plasticRes.data) {
          setPlasticCount(plasticRes.data.total || 0);
        }
        if (newRes.success && newRes.data) {
          setNewArrivalsCount(newRes.data.total || 0);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 text-xs font-outfit uppercase tracking-wider font-semibold text-text-primary dark:text-white">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-wider">VIMSA Admin Dashboard</h2>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold">
            Catalog overview across Dresses &amp; Home Essentials divisions
          </p>
        </div>
        <Link to="/admin/products?action=new" className="w-full sm:w-auto">
          <Button variant="accent" size="sm" className="w-full sm:w-auto flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: TOTAL PRODUCTS */}
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 sm:p-6 shadow-xs flex items-center justify-between rounded-xs">
          <div>
            <span className="text-[10px] text-text-secondary dark:text-neutral-500 font-bold block mb-1">TOTAL PRODUCTS</span>
            <span className="text-xl sm:text-2xl font-extrabold text-text-primary dark:text-white">{totalProducts}</span>
          </div>
          <div className="p-3 bg-accent/10 rounded-full text-accent shrink-0">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 2: DRESSES */}
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 sm:p-6 shadow-xs flex items-center justify-between rounded-xs">
          <div>
            <span className="text-[10px] text-text-secondary dark:text-neutral-500 font-bold block mb-1">DRESSES</span>
            <span className="text-xl sm:text-2xl font-extrabold text-pink-500">{dressesCount}</span>
          </div>
          <div className="p-3 bg-pink-500/10 rounded-full text-pink-500 shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 3: PLASTIC ITEMS */}
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 sm:p-6 shadow-xs flex items-center justify-between rounded-xs">
          <div>
            <span className="text-[10px] text-text-secondary dark:text-neutral-500 font-bold block mb-1">HOME ESSENTIALS</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-500">{plasticCount}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500 shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 4: NEW ARRIVALS */}
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 sm:p-6 shadow-xs flex items-center justify-between rounded-xs">
          <div>
            <span className="text-[10px] text-text-secondary dark:text-neutral-500 font-bold block mb-1">NEW ARRIVALS</span>
            <span className="text-xl sm:text-2xl font-extrabold text-accent">{newArrivalsCount}</span>
          </div>
          <div className="p-3 bg-accent/10 rounded-full text-accent shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Recent Products Table Section */}
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 sm:p-6 shadow-xs space-y-4 rounded-xs">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
          <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent">Recent Products</h3>
          <Link to="/admin/products" className="text-[10px] text-neutral-400 hover:text-accent transition-colors font-bold self-start sm:self-auto">
            View All Products &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border pb-3 text-[10px] text-text-secondary dark:text-gray-400 font-bold tracking-widest">
                <th className="pb-3 pr-4">Product Name</th>
                <th className="pb-3 pr-4">Division Type</th>
                <th className="pb-3 pr-4">SKU</th>
                <th className="pb-3 pr-4">Price</th>
                <th className="pb-3 pr-4">Stock</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-xs">
              {recentProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    No products added yet.
                  </td>
                </tr>
              ) : (
                recentProducts.map((p) => {
                  const divisionName = (p.productType || '').toUpperCase() === 'PLASTIC' ? 'PLASTIC' : 'DRESS';
                  return (
                    <tr key={p._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-text-primary dark:text-white flex items-center space-x-3 min-w-[180px]">
                        <img src={p.images?.[0]} alt={p.name} className="w-8 h-10 object-cover bg-neutral-100 shrink-0 rounded-xs" />
                        <span className="line-clamp-2">{p.name}</span>
                      </td>
                      <td className="py-3.5 pr-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-xs ${divisionName === 'PLASTIC' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-pink-500/10 text-pink-500'}`}>
                          {divisionName}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-[11px] text-text-secondary whitespace-nowrap">{p.sku}</td>
                      <td className="py-3.5 pr-4 font-bold text-text-primary dark:text-white whitespace-nowrap">{formatPrice(p.price)}</td>
                      <td className="py-3.5 pr-4 whitespace-nowrap">{p.stockQuantity} units</td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-xs ${p.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-200 text-neutral-600'}`}>
                          {p.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
