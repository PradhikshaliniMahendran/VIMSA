import React from 'react';
import { Link } from 'react-router-dom';

const CollectionsPage: React.FC = () => {
  const collections = [
    { name: 'Winter Premium 2026', slug: 'winter-premium-2026', desc: 'Heavyweight fleece garments designed for cold drapes.', gradient: 'from-[#0C0C0C] to-[#2B2B2B]' },
    { name: 'Urban Rebels', slug: 'urban-rebels', desc: 'Bold graphics and boxy, oversized streetwear silhouettes.', gradient: 'from-[#141A14] to-[#283828]' },
    { name: 'Core Basics', slug: 'core-basics', desc: 'Organic heavyweight tees and minimal branding items.', gradient: 'from-[#1A1815] to-[#3D3328]' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="lookbooks-page">
      <div className="text-center mb-16">
        <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-2 block">
          Visual Catalogues
        </span>
        <h1 className="text-2xl md:text-4xl font-outfit uppercase font-extrabold tracking-wider text-text-primary dark:text-white">
          Our Collections
        </h1>
        <div className="w-12 h-[2px] bg-accent mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {collections.map((c) => (
          <Link
            key={c.slug}
            to={`/shop?collection=${c.slug}`}
            className="group relative flex flex-col justify-end h-80 border border-neutral-200 dark:border-neutral-800 p-8 overflow-hidden rounded-sm hover:shadow-lg transition-shadow duration-300"
          >
            {/* Visual gradient backdrop */}
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} transform transition-transform duration-700 ease-out group-hover:scale-105`} />
            
            <div className="relative z-10 text-white space-y-2">
              <h3 className="font-outfit uppercase text-lg tracking-widest font-extrabold text-white group-hover:text-accent transition-colors duration-300">
                {c.name}
              </h3>
              <p className="text-[10px] text-neutral-400 font-inter leading-relaxed normal-case">
                {c.desc}
              </p>
              <div className="w-0 h-[2px] bg-accent group-hover:w-16 transition-all duration-300 mt-2" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CollectionsPage;
