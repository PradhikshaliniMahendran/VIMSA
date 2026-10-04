import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../ui/Button.tsx';

const FeaturedCategories: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-neutral-50 dark:bg-[#0E1015] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-2 block">
            Product Divisions
          </span>
          <h2 className="text-2xl md:text-4xl font-outfit uppercase font-extrabold tracking-wider text-text-primary dark:text-white">
            Shop by Division
          </h2>
          <div className="w-12 h-[2px] bg-accent mx-auto mt-4" />
        </div>

        {/* Division Banner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Division A Card: DRESSES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden rounded-md h-[400px] shadow-xl flex flex-col justify-end p-8 md:p-10 border border-neutral-200 dark:border-neutral-800"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1200')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="relative z-10 text-white max-w-md">
              <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-2 block">
                Fashion & Apparel
              </span>
              <h3 className="text-3xl font-outfit uppercase font-extrabold mb-3 tracking-wide text-white">
                Dresses
              </h3>
              <p className="text-sm text-neutral-300 font-inter mb-6 leading-relaxed">
                Discover the VIMSA fashion collection featuring luxury dresses, evening gowns, silk blouses, and tropical linen wear.
              </p>
              <Link to="/shop?type=DRESS">
                <Button variant="accent" size="md" className="group-hover:translate-x-1 transition-transform">
                  Explore Dresses &rarr;
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Division B Card: PLASTIC ITEMS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative overflow-hidden rounded-md h-[400px] shadow-xl flex flex-col justify-end p-8 md:p-10 border border-neutral-200 dark:border-neutral-800"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=1200')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="relative z-10 text-white max-w-md">
              <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-2 block">
                Everyday Household
              </span>
              <h3 className="text-3xl font-outfit uppercase font-extrabold mb-3 tracking-wide text-white">
                Home Essentials
              </h3>
              <p className="text-sm text-neutral-300 font-inter mb-6 leading-relaxed">
                Practical products for everyday living including airtight food storage sets, multi-tier organizers, and laundry hampers.
              </p>
              <Link to="/shop?type=PLASTIC">
                <Button variant="secondary" size="md" className="border-white text-white hover:bg-white hover:text-black group-hover:translate-x-1 transition-transform">
                  Explore Home Essentials &rarr;
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
