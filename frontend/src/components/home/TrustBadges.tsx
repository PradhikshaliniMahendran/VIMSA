import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: <Truck className="w-8 h-8 text-accent stroke-[1.5]" />,
      title: 'Free Shipping',
      desc: 'On all orders above Rs. 15,000 Islandwide',
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-accent stroke-[1.5]" />,
      title: '7-Day Return Policy',
      desc: 'Hassle-free size exchanges and returns',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-accent stroke-[1.5]" />,
      title: 'Secure Payments',
      desc: '100% encrypted checkout systems',
    },
    {
      icon: <Headphones className="w-8 h-8 text-accent stroke-[1.5]" />,
      title: '24/7 Priority Support',
      desc: 'Direct WhatsApp and email channels open',
    },
  ];

  return (
    <section className="py-16 bg-neutral-50 dark:bg-[#0e0e10] border-t border-gray-100 dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="mb-4 bg-white dark:bg-dark-surface p-4 rounded-full border border-gray-100 dark:border-dark-border shadow-sm">
                {badge.icon}
              </div>
              <h3 className="font-outfit uppercase tracking-wider text-xs font-bold text-text-primary dark:text-white mb-2">
                {badge.title}
              </h3>
              <p className="text-[10px] text-text-secondary dark:text-gray-400 font-semibold font-outfit max-w-[200px]">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
