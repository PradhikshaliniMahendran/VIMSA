import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { productService } from '../services/productService.ts';
import { ProductType } from '../components/ui/ProductCard.tsx';
import ProductCard from '../components/ui/ProductCard.tsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';
import Button from '../components/ui/Button.tsx';

const dressCategories = [
  { name: 'All Dresses & Clothing', slug: '' },
  { name: 'Dresses', slug: 'dresses' },
  { name: 'Tops & Blouses', slug: 'tops-blouses' },
  { name: 'Oversized Tees', slug: 'oversized-tees' },
  { name: 'Skirts & Bottoms', slug: 'skirts-bottoms' },
];

const plasticCategories = [
  { name: 'All Home Essentials', slug: '' },
  { name: 'Storage & Containers', slug: 'storage-containers' },
  { name: 'Household Organizers', slug: 'household-organizers' },
  { name: 'Kitchen Essentials', slug: 'kitchen-essentials' },
  { name: 'Buckets & Basins', slug: 'buckets-basins' },
];

const colorsList = ['#000000', '#FFFFFF', '#D4AF37', '#2E3B2E', '#F5F5DC', '#708090', '#FFB6C1', '#87CEEB'];
const topSizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const bottomSizesList = ['28', '30', '32', '34', '36', '38', '40', '42'];

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active state derived from URL
  const activeType = searchParams.get('type') || ''; // 'DRESS' | 'PLASTIC' | ''
  const activeCategory = searchParams.get('category') || '';
  const activeSearch = searchParams.get('search') || '';
  const activeSort = searchParams.get('sort') || '-createdAt';
  const activePage = parseInt(searchParams.get('page') || '1');

  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const queryParams: any = {
          page: activePage,
          limit: 12,
          sort: activeSort,
        };

        if (activeType) queryParams.productType = activeType;
        if (activeCategory) queryParams.category = activeCategory;
        if (activeSearch) queryParams.search = activeSearch;
        if (selectedColor && activeType !== 'PLASTIC') queryParams.color = selectedColor;
        if (selectedSize && activeType !== 'PLASTIC') queryParams.size = selectedSize;
        if (minPrice) queryParams.minPrice = Number(minPrice);
        if (maxPrice) queryParams.maxPrice = Number(maxPrice);

        if (searchParams.get('featured') === 'true') queryParams.isFeatured = true;
        if (searchParams.get('newArrival') === 'true') queryParams.isNewArrival = true;

        const response = await productService.getProducts(queryParams);
        if (response.success && response.data) {
          setProducts(response.data.products || []);
          setTotalProducts(response.data.total || 0);
          setTotalPages(response.data.pages || 1);
        }
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [searchParams, activeType, activeCategory, activeSearch, activeSort, activePage, selectedColor, selectedSize, minPrice, maxPrice]);

  const updateFilters = (newParams: Record<string, string>) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams, page: '1' } as Record<string, string>;

    Object.keys(merged).forEach((key) => {
      if (!merged[key]) delete merged[key];
    });

    setSearchParams(merged);
  };

  const handleTypeSelect = (type: string) => {
    updateFilters({ type, category: '', size: '', color: '' });
    setSelectedSize('');
    setSelectedColor('');
  };

  const handleCategorySelect = (slug: string, targetType?: string) => {
    const params: Record<string, string> = { category: slug };
    if (targetType) params.type = targetType;
    updateFilters(params);
  };

  const handleSortSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ sort: e.target.value });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      page: String(page),
    });
  };

  const handleClearAll = () => {
    setSelectedColor('');
    setSelectedSize('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
    setIsMobileFilterOpen(false);
  };

  const showClothingFilters = activeType !== 'PLASTIC';

  const renderFilterSidebar = () => (
    <div className="flex flex-col space-y-8 pr-4">
      {/* Categories Section — Completely Separated */}
      <div>
        {activeType === 'PLASTIC' ? (
          <div>
            <h3 className="font-outfit uppercase tracking-widest text-xs font-extrabold text-emerald-500 mb-3 flex items-center gap-1.5 border-b border-emerald-500/20 pb-1.5">
              <span>📦</span>
              <span>Home Essentials Categories</span>
            </h3>
            <ul className="space-y-2 font-outfit uppercase text-[11px] font-semibold">
              {plasticCategories.map((cat) => (
                <li key={cat.name}>
                  <button
                    onClick={() => handleCategorySelect(cat.slug, 'PLASTIC')}
                    className={`transition-colors duration-200 text-left w-full ${
                      activeCategory === cat.slug
                        ? 'text-emerald-500 font-extrabold pl-2 border-l-2 border-emerald-500'
                        : 'text-text-primary dark:text-gray-300 hover:text-emerald-500'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : activeType === 'DRESS' ? (
          <div>
            <h3 className="font-outfit uppercase tracking-widest text-xs font-extrabold text-pink-500 mb-3 flex items-center gap-1.5 border-b border-pink-500/20 pb-1.5">
              <span>👗</span>
              <span>Dresses &amp; Clothing Categories</span>
            </h3>
            <ul className="space-y-2 font-outfit uppercase text-[11px] font-semibold">
              {dressCategories.map((cat) => (
                <li key={cat.name}>
                  <button
                    onClick={() => handleCategorySelect(cat.slug, 'DRESS')}
                    className={`transition-colors duration-200 text-left w-full ${
                      activeCategory === cat.slug
                        ? 'text-pink-500 font-extrabold pl-2 border-l-2 border-pink-500'
                        : 'text-text-primary dark:text-gray-300 hover:text-pink-500'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Separate Block 1: Dresses & Clothing */}
            <div>
              <h3 className="font-outfit uppercase tracking-widest text-xs font-extrabold text-pink-500 mb-3 flex items-center gap-1.5 border-b border-pink-500/20 pb-1.5">
                <span>👗</span>
                <span>Dresses &amp; Clothing</span>
              </h3>
              <ul className="space-y-2 font-outfit uppercase text-[11px] font-semibold">
                {dressCategories.filter(c => c.slug !== '').map((cat) => (
                  <li key={cat.name}>
                    <button
                      onClick={() => handleCategorySelect(cat.slug, 'DRESS')}
                      className={`transition-colors duration-200 text-left w-full ${
                        activeCategory === cat.slug && activeType === 'DRESS'
                          ? 'text-pink-500 font-extrabold pl-2 border-l-2 border-pink-500'
                          : 'text-text-primary dark:text-gray-300 hover:text-pink-500'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Separate Block 2: Home Essentials */}
            <div>
              <h3 className="font-outfit uppercase tracking-widest text-xs font-extrabold text-emerald-500 mb-3 flex items-center gap-1.5 border-b border-emerald-500/20 pb-1.5">
                <span>📦</span>
                <span>Home Essentials</span>
              </h3>
              <ul className="space-y-2 font-outfit uppercase text-[11px] font-semibold">
                {plasticCategories.filter(c => c.slug !== '').map((cat) => (
                  <li key={cat.name}>
                    <button
                      onClick={() => handleCategorySelect(cat.slug, 'PLASTIC')}
                      className={`transition-colors duration-200 text-left w-full ${
                        activeCategory === cat.slug && activeType === 'PLASTIC'
                          ? 'text-emerald-500 font-extrabold pl-2 border-l-2 border-emerald-500'
                          : 'text-text-primary dark:text-gray-300 hover:text-emerald-500'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Sizing grid (Clothing Only) */}
      {showClothingFilters && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent">
                👖 Trousers / Waist (Inches)
              </h3>
              {bottomSizesList.includes(selectedSize) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSize('');
                    updateFilters({ size: '' });
                  }}
                  className="text-[9px] uppercase font-bold text-text-secondary hover:text-accent cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {bottomSizesList.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    const newSize = selectedSize === size ? '' : size;
                    setSelectedSize(newSize);
                    updateFilters({ size: newSize });
                  }}
                  className={`w-9 h-8 border text-xs font-outfit uppercase font-semibold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    selectedSize === size
                      ? 'bg-black border-black text-white dark:bg-white dark:text-black dark:border-white font-bold shadow-xs'
                      : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-gray-200 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent">
                👕 Tops &amp; Dresses
              </h3>
              {topSizesList.includes(selectedSize) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSize('');
                    updateFilters({ size: '' });
                  }}
                  className="text-[9px] uppercase font-bold text-text-secondary hover:text-accent cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topSizesList.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    const newSize = selectedSize === size ? '' : size;
                    setSelectedSize(newSize);
                    updateFilters({ size: newSize });
                  }}
                  className={`w-9 h-8 border text-xs font-outfit uppercase font-semibold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    selectedSize === size
                      ? 'bg-black border-black text-white dark:bg-white dark:text-black dark:border-white font-bold shadow-xs'
                      : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-gray-200 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Color circles (Clothing Only) */}
      {showClothingFilters && (
        <div>
          <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4">
            Color
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {colorsList.map((color) => (
              <button
                key={color}
                onClick={() => {
                  const newCol = selectedColor === color ? '' : color;
                  setSelectedColor(newCol);
                  updateFilters({ color: newCol });
                }}
                style={{ backgroundColor: color }}
                className={`w-6 h-6 rounded-full border transition-all duration-200 ${
                  selectedColor === color
                    ? 'border-accent scale-125 shadow-md'
                    : 'border-gray-300 dark:border-neutral-700'
                }`}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pricing Inputs */}
      <div>
        <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4">
          Price Range
        </h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min Rs."
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              updateFilters({ minPrice: e.target.value });
            }}
            className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs px-3 py-2 outline-none font-outfit uppercase tracking-wide"
          />
          <span className="text-text-secondary dark:text-neutral-500 text-xs">-</span>
          <input
            type="number"
            placeholder="Max Rs."
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              updateFilters({ maxPrice: e.target.value });
            }}
            className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs px-3 py-2 outline-none font-outfit uppercase tracking-wide"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="shop-catalog-page">
      {/* Title & Division Switcher */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-outfit uppercase tracking-widest text-2xl md:text-4xl font-extrabold text-text-primary dark:text-white">
          Shop VIMSA
        </h1>
        <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold font-outfit tracking-wider">
          Explore signature fashion dresses &amp; everyday home essentials ({totalProducts} products)
        </p>

        {/* Division Filter Switcher Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
          <button
            onClick={() => handleTypeSelect('')}
            className={`px-6 py-2.5 text-xs font-outfit uppercase tracking-widest font-bold border transition-all duration-300 ${
              activeType === ''
                ? 'bg-black border-black text-white dark:bg-white dark:text-black dark:border-white shadow-md'
                : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-white hover:border-black dark:hover:border-white'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => handleTypeSelect('DRESS')}
            className={`px-6 py-2.5 text-xs font-outfit uppercase tracking-widest font-bold border transition-all duration-300 ${
              activeType === 'DRESS'
                ? 'bg-pink-500 border-pink-500 text-white font-extrabold shadow-md'
                : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-white hover:border-pink-500'
            }`}
          >
            👗 Dresses &amp; Clothing
          </button>
          <button
            onClick={() => handleTypeSelect('PLASTIC')}
            className={`px-6 py-2.5 text-xs font-outfit uppercase tracking-widest font-bold border transition-all duration-300 ${
              activeType === 'PLASTIC'
                ? 'bg-emerald-500 border-emerald-500 text-white font-extrabold shadow-md'
                : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-white hover:border-emerald-500'
            }`}
          >
            📦 Home Essentials
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block lg:col-span-1">
          {renderFilterSidebar()}
        </aside>

        <section className="lg:col-span-3">
          <div className="flex justify-between items-center bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 mb-6 shadow-xs">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 text-xs font-outfit uppercase tracking-widest font-bold text-text-primary dark:text-white"
            >
              <Filter className="w-4 h-4 text-accent" />
              <span>Filters</span>
            </button>

            <span className="hidden sm:inline text-xs text-text-secondary dark:text-gray-400 font-semibold font-outfit uppercase tracking-wider">
              {totalProducts} items found
            </span>

            <div className="flex items-center space-x-2 font-outfit uppercase tracking-wider text-xs font-semibold">
              <span className="text-text-secondary dark:text-gray-400 hidden md:inline">Sort:</span>
              <select
                value={activeSort}
                onChange={handleSortSelect}
                className="bg-transparent border-none outline-none text-text-primary dark:text-white text-xs cursor-pointer font-bold focus:ring-0 uppercase tracking-widest"
              >
                <option value="-createdAt" className="bg-white dark:bg-dark-surface text-black dark:text-white">Newest Drops</option>
                <option value="price" className="bg-white dark:bg-dark-surface text-black dark:text-white">Price: Low to High</option>
                <option value="-price" className="bg-white dark:bg-dark-surface text-black dark:text-white">Price: High to Low</option>
                <option value="-stockQuantity" className="bg-white dark:bg-dark-surface text-black dark:text-white">Highest Stock</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="h-[40vh] flex justify-center items-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-gray-200 dark:border-dark-border">
              <p className="font-outfit uppercase tracking-widest text-sm font-semibold text-text-primary dark:text-white mb-2">
                No Products Found
              </p>
              <p className="text-xs text-text-secondary dark:text-gray-400 mb-6">
                Try adjusting your search or filters to discover VIMSA products.
              </p>
              <Button variant="primary" size="md" onClick={handleClearAll}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-3 mt-12 font-outfit uppercase font-semibold text-xs tracking-wider">
                  <button
                    disabled={activePage === 1}
                    onClick={() => handlePageChange(activePage - 1)}
                    className="px-4 py-2 border border-gray-200 dark:border-dark-border text-text-primary dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 border flex items-center justify-center transition-all ${
                          activePage === pageNum
                            ? 'bg-black border-black text-white dark:bg-white dark:text-black dark:border-white font-bold'
                            : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-white hover:border-black dark:hover:border-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={activePage === totalPages}
                    onClick={() => handlePageChange(activePage + 1)}
                    className="px-4 py-2 border border-gray-200 dark:border-dark-border text-text-primary dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white dark:bg-dark-surface h-full flex flex-col p-6 shadow-2xl z-10 overflow-y-auto scrollbar-none">
            <div className="flex justify-between items-center mb-8">
              <span className="font-outfit uppercase tracking-widest text-sm font-bold text-accent">Filters Menu</span>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-6 h-6 text-text-primary dark:text-white" />
              </button>
            </div>
            {renderFilterSidebar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
