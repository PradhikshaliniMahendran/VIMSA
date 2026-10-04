import React, { useState } from 'react';

const PolicyPages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'shipping' | 'returns'>('privacy');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="brand-policies-page">
      {/* Tabs list */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-dark-border mb-10 font-outfit uppercase text-[10px] font-bold tracking-widest gap-2">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'privacy' ? 'border-accent text-accent' : 'border-transparent text-text-secondary dark:text-gray-400'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'terms' ? 'border-accent text-accent' : 'border-transparent text-text-secondary dark:text-gray-400'
          }`}
        >
          Terms of Service
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'shipping' ? 'border-accent text-accent' : 'border-transparent text-text-secondary dark:text-gray-400'
          }`}
        >
          Shipping Rules
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'returns' ? 'border-accent text-accent' : 'border-transparent text-text-secondary dark:text-gray-400'
          }`}
        >
          Returns & Claims
        </button>
      </div>

      {/* Render selected policy */}
      <div className="text-xs md:text-sm text-text-secondary dark:text-gray-400 font-inter leading-relaxed font-semibold">
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="text-lg md:text-xl font-outfit uppercase font-extrabold text-text-primary dark:text-white mb-4">Privacy & Security</h2>
            <p>
              VIMSA Clothing respects client information privacy. All transaction logs and profile credentials are secure, encrypted with SSL certifications, and stored using secure schemas.
            </p>
            <p>
              We do not share, sell, or distribute profile databases or email subscriber registers to third-party vendors.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-6">
            <h2 className="text-lg md:text-xl font-outfit uppercase font-extrabold text-text-primary dark:text-white mb-4">Terms of Service</h2>
            <p>
              By accessing and buying from VIMSA E-Commerce, you agree to our standard operating parameters, prices, and shipment terms.
            </p>
            <p>
              Garment designs, logo crests, and media coordinates listed across the app remain the copyright property of VIMSA Clothing.
            </p>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <h2 className="text-lg md:text-xl font-outfit uppercase font-extrabold text-text-primary dark:text-white mb-4">Shipping & Logistics</h2>
            <p>
              We prioritize specialized delivery around Bogawanthalawa, Sri Lanka. Delivery addresses elsewhere are negotiable depending on standard courier availability. Outstation shipments generally take 3-5 business days. Delivery tracking updates are visible in the order tracking section.
            </p>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-6">
            <h2 className="text-lg md:text-xl font-outfit uppercase font-extrabold text-text-primary dark:text-white mb-4">Returns & Refunds</h2>
            <p>
              Size exchanges must be requested within 7 days of package delivery. Return items must be unworn, tagged, and in their original VIMSA packaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyPages;
