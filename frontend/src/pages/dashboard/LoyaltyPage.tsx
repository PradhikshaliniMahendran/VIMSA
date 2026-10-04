import React, { useEffect, useState } from 'react';
import { Gift, Award, HelpCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.ts';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';

const LoyaltyPage: React.FC = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const api = (await import('../../services/api.ts')).default;
        const response = await api.get('/user/loyalty-points');
        if (response.data.success) {
          setPoints(response.data.data?.loyaltyPoints || response.data.data || 0);
        }
      } catch (err) {
        console.error('Failed to load user loyalty points:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  const tiers = [
    { name: 'Bronze Member', range: '0 - 1,000 Points', benefit: 'Standard loyalty points earning on purchases' },
    { name: 'Silver Member', range: '1,001 - 5,000 Points', benefit: '5% discount on all drops, early release access' },
    { name: 'Gold VIP Elite', range: '5,001+ Points', benefit: '10% discount on all drops, free delivery islandwide, 24/7 personal customer executive' }
  ];

  return (
    <div className="space-y-6 text-xs font-outfit uppercase tracking-wider font-semibold text-text-primary dark:text-white">
      <div className="border-b border-gray-100 dark:border-dark-border pb-4">
        <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent">
          Loyalty Rewards
        </h3>
        <p className="text-[10px] text-text-secondary dark:text-gray-400 uppercase tracking-wider font-semibold font-outfit mt-0.5">
          Earning rewards, benefits, and luxury tiers with VIMSA
        </p>
      </div>

      {loading ? (
        <div className="h-24 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Current Points */}
          <div className="md:col-span-1 bg-black border border-accent/20 text-white p-6 rounded-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-4 right-4 w-12 h-12 bg-accent/5 rounded-full blur-md" />
            <div className="relative z-10">
              <Gift className="w-8 h-8 text-accent mb-4" />
              <h4 className="font-outfit uppercase text-[10px] font-bold text-accent">Rewards Balance</h4>
              <p className="font-outfit font-extrabold text-3xl text-white mt-1">
                {points.toLocaleString()} <span className="text-xs font-semibold text-accent">Points</span>
              </p>
            </div>
            <p className="text-[9px] text-neutral-500 font-semibold font-outfit tracking-wide mt-6 leading-relaxed">
              Earn 1 Point for every Rs. 100 spent. Redeem points on checkouts for custom discounts.
            </p>
          </div>

          {/* List: Tiers and Benefits */}
          <div className="md:col-span-2 bg-neutral-50 dark:bg-[#0E0E10] border border-gray-100 dark:border-dark-border p-6 rounded-sm space-y-4">
            <h4 className="font-outfit uppercase text-[10px] font-bold text-accent mb-4 flex items-center space-x-2">
              <Award className="w-4 h-4 text-accent" />
              <span>Membership Tier Benefits</span>
            </h4>
            <div className="space-y-4 text-xs font-inter leading-relaxed">
              {tiers.map((t, idx) => (
                <div key={idx} className="border-b border-gray-100 dark:border-dark-border pb-3 last:border-none last:pb-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="font-outfit uppercase tracking-wider text-xs font-bold text-text-primary dark:text-white">
                      {t.name}
                    </p>
                    <span className="text-[10px] text-accent font-bold font-outfit uppercase">{t.range}</span>
                  </div>
                  <p className="text-[10px] text-text-secondary dark:text-gray-400 font-medium normal-case">
                    {t.benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyPage;
