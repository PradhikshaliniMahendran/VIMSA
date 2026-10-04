import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { productService } from '../services/productService.ts';
import { ProductType } from '../components/ui/ProductCard.tsx';
import ProductCard from '../components/ui/ProductCard.tsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';

const GeneralStorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const activeSearch = searchParams.get('search') || '';
  const activeSort = searchParams.get('sort') || '-createdAt';
  const activePage = parseInt(searchParams.get('page') || '1');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const queryParams: any = {
          productType: 'general',
          page: activePage,
          limit: 12,
          sort: activeSort,
        };
        if (activeSearch) queryParams.search = activeSearch;
        if (minPrice) queryParams.minPrice = Number(minPrice);
        if (maxPrice) queryParams.maxPrice = Number(maxPrice);

        const response = await productService.getProducts(queryParams);
        if (response.success && response.data) {
          setProducts(response.data.products || []);
          setTotalProducts(response.data.total || 0);
          setTotalPages(response.data.pages || 1);
        }
      } catch (err) {
        console.error('Failed to load general store products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [searchParams, activeSearch, activeSort, activePage, minPrice, maxPrice]);

  const updateFilters = (newParams: Record<string, string>) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams, page: '1' } as Record<string, string>;
    Object.keys(merged).forEach((key) => { if (!merged[key]) delete merged[key]; });
    setSearchParams(merged);
  };

  const handleClearAll = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
    setIsMobileFilterOpen(false);
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page) });
  };

  const renderFilterSidebar = () => (
    <div className="flex flex-col space-y-8 pr-4">
      {/* Sort */}
      <div>
        <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4">Sort By</h3>
        <select
          value={activeSort}
          onChange={(e) => updateFilters({ sort: e.target.value })}
          className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs px-3 py-2 outline-none font-outfit uppercase tracking-wide"
        >
          <option value="-createdAt">Newest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-isFeatured">Featured First</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4">Price Range (LKR)</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); updateFilters({ minPrice: e.target.value }); }}
            className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs px-3 py-2 outline-none font-outfit"
          />
          <span className="text-text-secondary dark:text-neutral-500 text-xs">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); updateFilters({ maxPrice: e.target.value }); }}
            className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs px-3 py-2 outline-none font-outfit"
          />
        </div>
      </div>

      <button
        onClick={handleClearAll}
        className="w-full text-center border border-black dark:border-white text-text-primary dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black py-2.5 text-[10px] font-outfit uppercase tracking-widest font-bold transition-all duration-300"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="general-store-page">
      {/* Page Header */}
      <div className="mb-10 text-center md:text-left">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📦</span>
          <h1 className="font-outfit uppercase tracking-widest text-2xl md:text-3xl font-extrabold text-text-primary dark:text-white">
            Home Essentials
          </h1>
        </div>
        <p className="text-xs text-text-secondary dark:text-gray-400 uppercase font-semibold font-outfit tracking-wider">
          Storage containers, organizers &amp; everyday home essentials — {totalProducts} items available
        </p>
        {activeSearch && (
          <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold font-outfit tracking-wider">
            Showing results for "{activeSearch}"
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block lg:col-span-1">
          {renderFilterSidebar()}
        </aside>

        {/* Product Grid */}
        <section className="lg:col-span-3">
          {/* Mobile Filter Toggle */}
          <div className="flex justify-between items-center bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 mb-6 lg:hidden">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 text-xs font-outfit uppercase tracking-widest font-bold text-text-primary dark:text-white"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <span className="text-xs text-text-secondary dark:text-neutral-400 font-outfit uppercase font-semibold">
              {totalProducts} items
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center gap-4">
              <span className="text-6xl">📦</span>
              <h2 className="font-outfit uppercase text-xl font-bold text-text-primary dark:text-white">No Items Yet</h2>
              <p className="text-sm text-text-secondary dark:text-gray-400 font-inter max-w-sm">
                No general merchandise items have been added yet. Check back soon or clear your filters!
              </p>
              <button
                onClick={handleClearAll}
                className="mt-2 border border-black dark:border-white text-text-primary dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black py-2.5 px-8 text-[10px] font-outfit uppercase tracking-widest font-bold transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 border text-xs font-outfit font-bold transition-all ${
                        activePage === page
                          ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                          : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-white hover:border-black dark:hover:border-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative bg-white dark:bg-dark-bg w-80 max-w-[90vw] h-full overflow-y-auto p-6 shadow-2xl ml-0 mr-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-outfit uppercase tracking-widest text-sm font-bold">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderFilterSidebar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralStorePage;
