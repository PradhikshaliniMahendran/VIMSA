import React from 'react';

const BrandStory: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Brand Ethos Text */}
          <div>
            <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4 block">
              The Brand Story
            </span>
            <h2 className="text-3xl md:text-5xl font-outfit uppercase font-extrabold tracking-wider text-text-primary dark:text-white mb-8 leading-[1.1]">
              Uncompromising Quality. Minimalist Gold.
            </h2>
            <div className="space-y-4 text-xs md:text-sm text-text-secondary dark:text-gray-400 font-inter leading-relaxed max-w-xl">
              <p>
                Founded in 2026, VIMSA arose from a simple observation: modern streetwear lacked structural permanence. Fast fashion items lost shape, print fidelity, and comfort after a single wash.
              </p>
              <p>
                We set out to build garments that stand the test of time. Every hoodie in our inventory is structured from 450GSM combed cotton, double-lined, and finished with metallic gold elements.
              </p>
              <p>
                We do not compromise on our process. From the organic fields of our cotton supply to the custom gold embroidery of our logo crests, each piece undergoes extensive checks for symmetry, seams, and fit.
              </p>
            </div>
          </div>

          {/* Aesthetic Graphic Side Card */}
          <div className="bg-black text-white p-10 md:p-16 border border-accent/20 flex flex-col justify-center h-80 relative overflow-hidden select-none">
            {/* Subtle background details */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.06),transparent_50%)]" />
            <div className="relative z-10">
              <h3 className="font-outfit uppercase tracking-widest font-extrabold text-xs text-accent mb-2">
                Our Signature Standard
              </h3>
              <p className="font-outfit uppercase font-extrabold text-2xl tracking-wide mb-6">
                450GSM Combed Cotton
              </p>
              <div className="w-16 h-[2px] bg-accent mb-6" />
              <p className="text-[11px] text-neutral-400 font-inter leading-relaxed font-semibold max-w-sm">
                Each VIMSA piece is weighted, measured, and detailed to achieve the perfect boxy, oversized streetwear drape.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
