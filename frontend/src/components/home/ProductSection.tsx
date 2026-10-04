import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard, { ProductType } from '../ui/ProductCard.tsx';
import LoadingSpinner from '../ui/LoadingSpinner.tsx';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: ProductType[];
  loading?: boolean;
  viewAllLink?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  products,
  loading = false,
  viewAllLink,
}) => {
  return (
    <section className="py-16 bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
          <div>
            <h2 className="text-xl md:text-3xl font-outfit uppercase font-extrabold tracking-wider text-text-primary dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 uppercase tracking-wide font-semibold font-outfit">
                {subtitle}
              </p>
            )}
          </div>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs font-outfit uppercase tracking-widest font-bold text-accent border-b border-transparent hover:border-accent transition-all duration-300 mt-4 md:mt-0"
            >
              View All Collection &rarr;
            </Link>
          )}
        </div>

        {/* Loading Ring State */}
        {loading ? (
          <div className="h-64 flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-secondary uppercase tracking-widest font-semibold">
            No premium products currently available in this section.
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
