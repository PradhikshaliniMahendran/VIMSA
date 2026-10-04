import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchBarOpen } from '../store/slices/uiSlice.ts';
import { RootState } from '../store/index.ts';
import { productService } from '../services/productService.ts';
import { ProductType } from './ui/ProductCard.tsx';
import { useCart } from '../hooks/useCart.ts';

const SearchBar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state: RootState) => state.ui.searchBarOpen);
  const { formatPrice } = useCart();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on search bar opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle live suggestions fetching
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await productService.getProducts({ search: query, limit: 5 });
        if (response.success && response.data?.products) {
          setResults(response.data.products);
        }
      } catch (err) {
        console.error('Search suggestions error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!isOpen) return null;

  const handleClose = () => {
    setQuery('');
    setResults([]);
    dispatch(setSearchBarOpen(false));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col pt-12 px-6 md:px-24">
      {/* Top Header Controls */}
      <div className="flex justify-between items-center w-full max-w-6xl mx-auto mb-12">
        <span className="font-outfit uppercase tracking-widest text-xs text-accent font-bold">Search VIMSA</span>
        <button
          onClick={handleClose}
          className="text-white hover:text-accent transition-colors duration-200"
          aria-label="Close Search"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Main Search Input Form */}
      <div className="w-full max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative border-b border-white/20 pb-4 flex items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder="What are you looking for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white text-2xl md:text-4xl font-outfit uppercase tracking-wider font-semibold placeholder-white/30 border-none outline-none focus:ring-0"
          />
          <button type="submit" className="text-white hover:text-accent transition-colors duration-200">
            <Search className="w-8 h-8" />
          </button>
        </form>

        {/* Search Results / Suggestions Panel */}
        <div className="mt-8 overflow-y-auto max-h-[60vh] scrollbar-thin">
          {loading && (
            <div className="py-4 text-center">
              <span className="font-outfit uppercase tracking-wider text-xs text-accent-light">Searching items...</span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="flex flex-col space-y-4">
              <h4 className="font-outfit uppercase text-xs tracking-wider text-white/50 mb-2">Suggestions</h4>
              {results.map((product) => (
                <div
                  key={product._id}
                  onClick={() => {
                    navigate(`/shop/${product.slug}`);
                    handleClose();
                  }}
                  className="flex items-center justify-between p-3 bg-neutral-900/40 border border-white/5 hover:border-accent/40 cursor-pointer transition-all duration-300 rounded"
                >
                  <div className="flex items-center space-x-4">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-16 object-cover bg-neutral-800"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gradient-to-tr from-[#111] to-[#333] flex items-center justify-center">
                        <span className="text-[6px] text-white/40 uppercase">VIMSA</span>
                      </div>
                    )}
                    <div>
                      <p className="font-outfit uppercase font-semibold text-sm text-white">{product.name}</p>
                      <p className="text-xs text-accent mt-0.5">
                        {product.salePrice ? formatPrice(product.salePrice) : formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-accent" />
                </div>
              ))}
            </div>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="py-8 text-center text-white/40 font-outfit uppercase tracking-wider text-sm">
              No products matching "{query}"
            </div>
          )}

          {query.trim().length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white/60">
              <div>
                <h4 className="font-outfit uppercase text-xs tracking-wider text-accent font-bold mb-4">Trending Searches</h4>
                <ul className="space-y-3 font-outfit uppercase text-sm font-semibold">
                  {['Oversized Hoodies', 'Cargo Pants', 'Streetwear Heavy Tee', 'Gold Accessories'].map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(term);
                          navigate(`/shop?search=${encodeURIComponent(term)}`);
                          handleClose();
                        }}
                        className="hover:text-accent transition-colors duration-200"
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-outfit uppercase text-xs tracking-wider text-accent font-bold mb-4">VIMSA Collections</h4>
                <ul className="space-y-3 font-outfit uppercase text-sm font-semibold">
                  {['Winter Premium 2026', 'Urban Rebels', 'Core Basics'].map((colName) => (
                    <li key={colName}>
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/shop?collection=${encodeURIComponent(colName)}`);
                          handleClose();
                        }}
                        className="hover:text-accent transition-colors duration-200"
                      >
                        {colName}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
