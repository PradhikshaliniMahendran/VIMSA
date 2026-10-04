import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService.ts';
import { ProductType } from '../components/ui/ProductCard.tsx';
import ProductCard from '../components/ui/ProductCard.tsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';

const NewArrivalsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await productService.getNewArrivals();
        if (response.success && response.data) {
          setProducts(response.data.products || response.data);
        }
      } catch (err) {
        console.error('Failed to load new arrivals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="new-arrivals-page">
      <div className="text-center mb-16">
        <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-2 block">
          Fresh Drops
        </span>
        <h1 className="text-2xl md:text-4xl font-outfit uppercase font-extrabold tracking-wider text-text-primary dark:text-white">
          New Arrivals
        </h1>
        <div className="w-12 h-[2px] bg-accent mx-auto mt-4" />
      </div>

      {loading ? (
        <div className="h-64 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-xs text-text-secondary uppercase tracking-widest font-semibold font-outfit">
          No new arrivals listed in the catalogue at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewArrivalsPage;
