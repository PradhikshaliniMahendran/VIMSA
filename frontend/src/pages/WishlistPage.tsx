import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { wishlistService } from '../services/wishlistService.ts';
import { setWishlist } from '../store/slices/wishlistSlice.ts';
import { ProductType } from '../components/ui/ProductCard.tsx';
import ProductCard from '../components/ui/ProductCard.tsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';
import Button from '../components/ui/Button.tsx';
import toast from 'react-hot-toast';

const WishlistPage: React.FC = () => {
  const dispatch = useDispatch();
  const [items, setItems] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch full wishlist items on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await wishlistService.getWishlist();
        if (response.success && response.data) {
          // If response.data is an array of products
          const products = response.data.products || response.data || [];
          setItems(products);
          
          // Sync IDs with local redux state
          const ids = products.map((p: any) => p._id || p);
          dispatch(setWishlist(ids));
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [dispatch]);

  const handleRemove = async (id: string) => {
    try {
      const response = await wishlistService.removeFromWishlist(id);
      if (response.success) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        toast.success('Product removed from wishlist');
      }
    } catch (err) {
      toast.error('Failed to remove product from wishlist');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="wishlist-page">
      {/* Title */}
      <div className="text-center mb-16">
        <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-2 block">
          Your Curated Style
        </span>
        <h1 className="text-2xl md:text-4xl font-outfit uppercase font-extrabold tracking-wider text-text-primary dark:text-white">
          Saved Favorites
        </h1>
        <div className="w-12 h-[2px] bg-accent mx-auto mt-4" />
      </div>

      {loading ? (
        <div className="h-[40vh] flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4 stroke-1" />
          <p className="font-outfit uppercase tracking-wider text-sm font-semibold text-text-primary dark:text-white mb-2">
            Wishlist is Empty
          </p>
          <p className="text-xs text-text-secondary dark:text-gray-400 mb-8 max-w-xs mx-auto">
            Browse through our luxury drops and add clothing items to your private wardrobe.
          </p>
          <Link to="/shop">
            <Button variant="primary" size="md">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <div key={product._id} className="relative group">
              <ProductCard product={product} />
              
              {/* Overlay Trash Icon for direct removal */}
              <button
                onClick={() => handleRemove(product._id)}
                className="absolute bottom-24 right-4 p-2.5 bg-black text-white hover:text-error border border-neutral-800 transition-colors z-20"
                title="Remove from favorites"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
