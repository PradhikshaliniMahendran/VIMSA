import React, { useEffect, useState } from 'react';
import HeroSlider from '../components/home/HeroSlider.tsx';
import WelcomeBanner from '../components/home/WelcomeBanner.tsx';
import FeaturedCategories from '../components/home/FeaturedCategories.tsx';
import ProductSection from '../components/home/ProductSection.tsx';
import FlashSale from '../components/home/FlashSale.tsx';
import Newsletter from '../components/home/Newsletter.tsx';
import BrandStory from '../components/home/BrandStory.tsx';
import TrustBadges from '../components/home/TrustBadges.tsx';
import CustomerReviews from '../components/home/CustomerReviews.tsx';
import { productService } from '../services/productService.ts';
import { ProductType } from '../components/ui/ProductCard.tsx';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductType[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductType[]>([]);
  const [generalProducts, setGeneralProducts] = useState<ProductType[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingGeneral, setLoadingGeneral] = useState(true);

  useEffect(() => {
    // Clothing: Featured
    const fetchFeatured = async () => {
      try {
        const res = await productService.getFeatured('clothing');
        if (res.success && res.data) setFeaturedProducts(res.data.products || res.data);
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoadingFeatured(false);
      }
    };

    // Clothing: New Arrivals
    const fetchNewArrivals = async () => {
      try {
        const res = await productService.getNewArrivals('clothing');
        if (res.success && res.data) setNewArrivals(res.data.products || res.data);
      } catch (err) {
        console.error('Failed to load new arrivals:', err);
      } finally {
        setLoadingNew(false);
      }
    };

    // General Merchandise: Featured or New Arrivals
    const fetchGeneral = async () => {
      try {
        // Try featured general first, fall back to new arrivals
        let res = await productService.getFeatured('general');
        let items = (res.success && res.data) ? (res.data.products || res.data) : [];
        if (items.length === 0) {
          res = await productService.getNewArrivals('general');
          items = (res.success && res.data) ? (res.data.products || res.data) : [];
        }
        if (items.length === 0) {
          // Last resort: fetch any general products
          const fallback = await productService.getProducts({ productType: 'general', limit: 8 });
          items = (fallback.success && fallback.data) ? (fallback.data.products || []) : [];
        }
        setGeneralProducts(items);
      } catch (err) {
        console.error('Failed to load general products:', err);
      } finally {
        setLoadingGeneral(false);
      }
    };

    fetchFeatured();
    fetchNewArrivals();
    fetchGeneral();
  }, []);

  return (
    <div className="w-full">
      {/* 1. Hero banner slideshow */}
      <HeroSlider />

      {/* 1b. Welcoming Marquee Greeting in English, Sinhala & Tamil */}
      <WelcomeBanner />

      {/* 2. Trust factors banner */}
      <TrustBadges />

      {/* 3. Category cards grid */}
      <FeaturedCategories />

      {/* 4. Featured clothing items — CLOTHING ONLY */}
      <ProductSection
        title="Featured Collection"
        subtitle="Exclusive signature clothing"
        products={featuredProducts}
        loading={loadingFeatured}
        viewAllLink="/shop?featured=true"
      />

      {/* 5. Limited Flash sale countdown */}
      <FlashSale />

      {/* 6. New clothing arrivals — CLOTHING ONLY */}
      <ProductSection
        title="New Arrivals"
        subtitle="Fresh drops from VIMSA"
        products={newArrivals}
        loading={loadingNew}
        viewAllLink="/shop?newArrival=true"
      />

      {/* 7. General Merchandise section — GENERAL ONLY, separate from clothing */}
      {(loadingGeneral || generalProducts.length > 0) && (
        <ProductSection
          title="Home Essentials"
          subtitle="Everyday home essentials & household organizers"
          products={generalProducts}
          loading={loadingGeneral}
          viewAllLink="/general-store"
        />
      )}

      {/* 8. Brand narrative section */}
      <BrandStory />

      {/* 9. Customer reviews cards */}
      <CustomerReviews />

      {/* 10. Mail subscriber block */}
      <Newsletter />
    </div>
  );
};

export default HomePage;
