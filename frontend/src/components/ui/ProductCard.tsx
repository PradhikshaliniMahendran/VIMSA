import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../../store/slices/wishlistSlice.ts';
import { RootState } from '../../store/index.ts';
import { useCart } from '../../hooks/useCart.ts';
import Badge from './Badge.tsx';
import toast from 'react-hot-toast';
import { parseColor } from '../../utils/colorHelper.ts';

export interface ProductType {
  _id: string;
  name: string;
  sku: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
  stockQuantity: number;
  colors: string[];
  colorImages?: Record<string, string>;
  specifications?: { key: string; value: string }[];
  sizes: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  discountPercentage?: number;
  description?: string;
  status?: 'active' | 'out_of_stock' | 'draft' | 'archived';
  productType?: string;
  category?: any;
  aiGenerationStatus?: 'none' | 'pending' | 'completed' | 'failed';
  aiGenerationError?: string;
  gallery?: string[];
}

interface ProductCardProps {
  product: ProductType;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const { addItem, formatPrice } = useCart();
  const wishlistIds = useSelector((state: RootState) => state.wishlist.productIds);
  const isWishlisted = wishlistIds.includes(product._id);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [isHovered, setIsHovered] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product._id));
    if (isWishlisted) {
      toast.success('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  const validSizes = (product.sizes || []).filter((s: any) => typeof s === 'object' && s.name);
  const totalStock = validSizes.length > 0
    ? validSizes.reduce((sum, size: any) => sum + Number(size.stock || 0), 0)
    : product.stockQuantity;

  const isUnavailable = product.status === 'out_of_stock' || totalStock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Allow adding out-of-stock items for later use

    addItem({
      id: product._id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0] || '',
      quantity: 1,
      size: product.sizes?.[0] || 'M',
      color: selectedColor || product.colors?.[0] || 'Black',
      stockQuantity: product.stockQuantity,
    });
    toast.success(`${product.name} added to cart`);
  };

  const renderBadge = () => {
    if (isUnavailable) {
      return <Badge variant="soldout">Sold Out</Badge>;
    }
    if (product.salePrice) {
      return <Badge variant="sale">Sale</Badge>;
    }
    if (product.isNewArrival) {
      return <Badge variant="new">New</Badge>;
    }
    if (product.isTrending) {
      return <Badge variant="trending">Trending</Badge>;
    }
    // Low stock warning: show when total stock is between 1 and 5
    if (totalStock > 0 && totalStock <= 5) {
      return (
        <span className="inline-block bg-orange-500 text-white text-[9px] font-outfit font-extrabold uppercase tracking-widest px-2 py-0.5">
          Only {totalStock} left!
        </span>
      );
    }
    return null;
  };

  // Generate a beautiful premium gradient based on product slug if image is missing
  const getGradient = (slug: string) => {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
      hash = slug.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'from-[#0F0F0F] to-[#262626]',
      'from-[#1A1A1D] to-[#3B3B3F]',
      'from-[#121212] to-[#2D2A26]',
      'from-[#0D0D0C] to-[#2D2922]',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <motion.div
      className="group relative flex flex-col bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Product Image Section */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-neutral-900">
        <Link to={`/shop/${product.slug}`} className="block w-full h-full">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-tr ${getGradient(product.slug)} flex items-center justify-center`}>
              <span className="font-outfit uppercase tracking-widest text-[10px] text-accent font-semibold opacity-60">
                VIMSA Luxury
              </span>
            </div>
          )}
        </Link>

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1 z-10">
          {renderBadge()}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-black/60 text-text-primary dark:text-white backdrop-blur-sm transition-all duration-300 hover:bg-white dark:hover:bg-black hover:text-accent dark:hover:text-accent z-10"
          aria-label="Toggle Wishlist"
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-accent text-accent' : ''}`}
          />
        </button>

        {/* Quick Add To Cart Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 bg-gradient-to-t from-black/60 to-transparent z-10 hidden md:block">
          <button
            onClick={handleQuickAdd}
            disabled={false}
            className={`w-full py-2.5 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2
              ${isUnavailable ? 'bg-gray-300 text-gray-700 hover:bg-gray-400' : 'bg-primary text-white hover:bg-primary-dark'}
            `}
          >
            <span>{isUnavailable ? 'Save for Later' : 'Quick Add'}</span>
          </button>
        </div>
      </div>

      {/* Info Details Section */}
      <div className="flex flex-col p-4 flex-grow border-t border-gray-50 dark:border-dark-border">
        {/* Rating Block */}
        <div className="flex items-center space-x-1 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-accent text-accent" />
          ))}
          <span className="text-[10px] text-text-secondary dark:text-gray-400 font-medium">(5.0)</span>
        </div>

        {/* Product Title */}
        <Link to={`/shop/${product.slug}`} className="hover:text-accent transition-colors duration-200">
          <h3 className="font-outfit uppercase font-semibold text-xs tracking-wide text-text-primary dark:text-white line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center space-x-1.5 my-2">
            {product.colors.map((color) => {
              const { name, hex } = parseColor(color);
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: hex }}
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                    selectedColor === color
                      ? 'border-accent scale-125'
                      : 'border-gray-300 dark:border-neutral-700'
                  }`}
                  title={name}
                />
              );
            })}
          </div>
        )}

        {/* Pricing Block */}
        <div className="mt-auto pt-2 flex items-baseline justify-between space-x-2">
          <div className="flex items-baseline space-x-2">
            {product.salePrice ? (
              <>
                <span className="text-sm font-outfit font-bold text-error">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-xs text-text-secondary dark:text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-outfit font-bold text-text-primary dark:text-white">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          <div className="text-[10px] font-semibold">
            {isUnavailable ? (
              <span className="text-red-500">Out of stock</span>
            ) : totalStock <= 5 ? (
              <span className="text-orange-500 font-bold">Only {totalStock} left!</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">{totalStock} in stock</span>
            )}
          </div>
        </div>

        {/* Mobile Quick Add Button */}
        <div className="mt-3 md:hidden">
          <button
            onClick={handleQuickAdd}
            disabled={isUnavailable}
            className="w-full bg-black text-white dark:bg-white dark:text-black py-2 text-[10px] font-outfit uppercase tracking-widest font-bold hover:bg-accent dark:hover:bg-accent hover:text-black dark:hover:text-black transition-colors duration-300 flex items-center justify-center space-x-1.5"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>{isUnavailable ? 'Save for Later' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
