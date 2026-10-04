import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import Button from './Button.tsx';

interface Promotion {
  _id: string;
  title: string;
  description?: string;
  discountText?: string;
  bannerImage?: string;
  ctaText?: string;
  ctaLink?: string;
  startDate: string;
  endDate: string;
  status: string;
}

const PromotionalPopup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only check and open active promotion popups on homepage or when loading website
    const isHomePage = location.pathname === '/' || location.pathname === '';
    
    const fetchActivePromotion = async () => {
      try {
        const api = (await import('../../services/api.ts')).default;
        const res = await api.get('/promotions/active');
        if (res.data?.success && res.data?.data?.promotion) {
          const promo = res.data.data.promotion;
          setPromotion(promo);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to load active promotion:', err);
      }
    };

    if (isHomePage) {
      fetchActivePromotion();
    }
  }, [location.pathname]);

  // Keyboard ESC listener to close popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCtaClick = () => {
    const targetLink = promotion?.ctaLink || '/shop?type=DRESS';
    handleClose();
    navigate(targetLink);
  };

  if (!isOpen || !promotion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Dark overlay backdrop — clicking outside closes popup without navigating */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
        onClick={handleClose}
      />

      {/* Premium VIMSA Offer Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-surface shadow-2xl border border-gray-100 dark:border-dark-border overflow-hidden z-10 animate-fade-in">
        {/* Top-Right Close Button (x Close) */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 text-white/80 hover:text-white bg-black/60 hover:bg-black p-1.5 rounded-full transition-colors flex items-center gap-1 text-[10px] font-outfit uppercase font-bold tracking-wider px-2.5"
          aria-label="Close promotion popup"
        >
          <X className="w-4 h-4" />
          <span>Close</span>
        </button>

        {/* Optional Banner Image — Displays full image uncropped */}
        {promotion.bannerImage ? (
          <div className="relative w-full max-h-[70vh] bg-black/95 overflow-hidden flex items-center justify-center">
            <img
              src={promotion.bannerImage}
              alt={promotion.title}
              className="w-full h-auto max-h-[420px] object-contain block"
            />
            
            {/* Discount Badge Overlay */}
            {promotion.discountText && (
              <div className="absolute bottom-3 left-4 z-10 bg-accent text-black font-outfit font-extrabold text-xs uppercase tracking-widest px-3 py-1 shadow-lg">
                {promotion.discountText}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-black p-6 border-b border-accent/20">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="font-outfit uppercase text-xs font-bold text-accent tracking-widest">
                VIMSA Exclusive Offer
              </span>
            </div>
          </div>
        )}

        {/* Card Content Body */}
        <div className="p-6 sm:p-8 text-center space-y-4">
          {!promotion.bannerImage && promotion.discountText && (
            <div className="inline-block bg-accent/10 border border-accent/30 text-accent font-outfit font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 mb-2">
              {promotion.discountText}
            </div>
          )}

          <span className="font-outfit uppercase text-[10px] text-accent tracking-widest font-extrabold block">
            VIMSA SPECIAL OFFER
          </span>

          <h2 className="text-xl sm:text-2xl font-outfit uppercase font-extrabold text-text-primary dark:text-white tracking-wider">
            {promotion.title}
          </h2>

          {promotion.description && (
            <p className="text-xs text-text-secondary dark:text-neutral-300 font-inter leading-relaxed max-w-md mx-auto font-medium">
              {promotion.description}
            </p>
          )}

          <div className="pt-2 flex flex-col space-y-2">
            <Button
              variant="accent"
              size="lg"
              onClick={handleCtaClick}
              className="w-full flex items-center justify-center space-x-2 font-extrabold uppercase tracking-widest text-xs py-3.5"
            >
              <span>{promotion.ctaText || 'Shop Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <button
              onClick={handleClose}
              className="text-[11px] text-text-secondary hover:text-text-primary dark:hover:text-white font-outfit uppercase tracking-wider font-semibold py-1 transition-colors"
            >
              No thanks, dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalPopup;
