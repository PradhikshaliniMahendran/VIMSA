import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button.tsx';
import heroFashionBg from '../../assets/hero_fashion_bg.png';
import heroDressesBg from '../../assets/hero_dresses_bg.png';
import heroEssentialsBg from '../../assets/hero_essentials_bg.png';

interface Slide {
  id: number;
  tagline: string;
  title1: string;
  goldWord: string;
  title2: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  bgImage: string;
}

const slides: Slide[] = [
  {
    id: 1,
    tagline: 'VIMSA Luxury Clothing',
    title1: 'Style. Everyday',
    goldWord: 'Essentials.',
    title2: 'VIMSA.',
    subtitle: 'Discover signature fashion dresses and everyday home essentials, brought together under VIMSA.',
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
    secondaryCtaText: 'Shop Dresses',
    secondaryCtaLink: '/shop?type=DRESS',
    bgImage: heroFashionBg,
  },
  {
    id: 2,
    tagline: 'Dresses & Couture',
    title1: 'Luxury',
    goldWord: 'Satin & Silk',
    title2: 'Dresses',
    subtitle: 'Floral midi dresses, mulberry silk blouses, and timeless evening wear crafted for elegance.',
    ctaText: 'Shop Dresses Collection',
    ctaLink: '/shop?type=DRESS',
    secondaryCtaText: 'Explore All Products',
    secondaryCtaLink: '/shop',
    bgImage: heroDressesBg,
  },
  {
    id: 3,
    tagline: 'Household & Living',
    title1: 'Modern',
    goldWord: 'Home',
    title2: 'Essentials',
    subtitle: 'Airtight food containers, multi-tier kitchen organizers, and premium household storage solutions.',
    ctaText: 'Shop Home Essentials',
    ctaLink: '/shop?type=PLASTIC',
    secondaryCtaText: 'Explore Collection',
    secondaryCtaLink: '/shop',
    bgImage: heroEssentialsBg,
  },
];

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slide transitions
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const activeSlide = slides[currentSlide];

  return (
    <div className="relative w-full h-[80vh] md:h-[90vh] bg-black overflow-hidden flex items-center justify-center">
      {/* Background Images Stack — Smooth Seamless Crossfade */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            currentSlide === index ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${slide.bgImage})` }}
        />
      ))}

      {/* Dark Luxury Gradient Overlay for Maximum Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none" />

      {/* Subtle Golden Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Text Content Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-white select-none"
        >
          <div className="max-w-2xl">
            {/* Top Tagline */}
            <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4 block">
              {activeSlide.tagline}
            </span>

            {/* Huge Headline */}
            <h1 className="text-4xl md:text-6xl font-outfit uppercase font-extrabold tracking-wide leading-[1.1] mb-6 drop-shadow-md">
              {activeSlide.title1}{' '}
              <span className="gold-gradient-text block sm:inline">{activeSlide.goldWord}</span>{' '}
              {activeSlide.title2}
            </h1>

            {/* Subheading */}
            <p className="text-sm md:text-base text-neutral-300 font-inter mb-8 leading-relaxed max-w-lg drop-shadow-sm font-semibold">
              {activeSlide.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link to={activeSlide.ctaLink}>
                <Button variant="accent" size="lg" className="font-extrabold uppercase tracking-widest">
                  {activeSlide.ctaText}
                </Button>
              </Link>
              <Link to={activeSlide.secondaryCtaLink}>
                <Button variant="secondary" size="lg" className="border-white text-white hover:bg-white hover:text-black font-extrabold uppercase tracking-widest">
                  {activeSlide.secondaryCtaText}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots Indicator Overlay */}
      <div className="absolute bottom-8 flex justify-center space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-accent w-8' : 'bg-white/40 hover:bg-white/70 w-2.5'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
