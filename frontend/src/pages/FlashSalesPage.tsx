import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService.ts';
import { ProductType } from '../components/ui/ProductCard.tsx';
import ProductCard from '../components/ui/ProductCard.tsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';

const FlashSalesPage: React.FC = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const response = await productService.getFlashSale();
        if (response.success && response.data) {
          setProducts(response.data.products || response.data);
        } else {
          // If no flash sale endpoint is specific, filter by salePrice
          const allRes = await productService.getProducts({ limit: 50 });
          if (allRes.success && allRes.data?.products) {
            setProducts(allRes.data.products.filter((p: ProductType) => p.salePrice !== null));
          }
        }
      } catch (err) {
        console.error('Failed to load flash sale products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="flash-sales-page">
      <div className="text-center mb-16">
        <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-2 block animate-pulse">
          Limited Drop Discount
        </span>
        <h1 className="text-2xl md:text-4xl font-outfit uppercase font-extrabold tracking-wider text-text-primary dark:text-white">
          Flash Sales
        </h1>
        <div className="w-12 h-[2px] bg-accent mx-auto mt-4" />
      </div>

      {loading ? (
        <div className="h-64 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-xs text-text-secondary uppercase tracking-widest font-semibold font-outfit">
          No flash sale apparel listed in catalogue at the moment.
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

export default FlashSalesPage;
