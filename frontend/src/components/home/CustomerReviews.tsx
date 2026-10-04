import React, { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface Review {
  _id: string;
  user?: { firstName?: string; lastName?: string } | null;
  rating: number;
  comment: string;
  product?: { name: string };
}

const CustomerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const api = (await import('../../services/api.ts')).default;
        const response = await api.get('/reviews/recent');
        if (response.data.success && response.data.data.reviews) {
          setReviews(response.data.data.reviews);
        }
      } catch (err) {
        console.error('Failed to fetch recent reviews', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading || reviews.length === 0) {
    return null; // Hide completely if no real reviews exist
  }

  return (
    <section className="py-24 bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-2 block">
            Reviews
          </span>
          <h2 className="text-2xl md:text-4xl font-outfit uppercase font-extrabold tracking-wider text-text-primary dark:text-white">
            Client Testimonials
          </h2>
          <div className="w-12 h-[2px] bg-accent mx-auto mt-4" />
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, index) => {
            const firstName = rev.user?.firstName || 'VIMSA';
            const lastName = rev.user?.lastName || 'Client';
            return (
              <motion.div
                key={rev._id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bg-neutral-50 dark:bg-[#0E0E10] border border-gray-100 dark:border-dark-border p-8 relative flex flex-col justify-between"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-accent/10" />

                <div>
                  {/* Stars Rating */}
                  <div className="flex space-x-1 mb-4">
                    {[...Array(Math.max(0, Math.min(5, Math.floor(rev.rating || 0))))].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                    ))}
                  </div>

                  <p className="text-xs md:text-sm text-text-secondary dark:text-gray-400 font-medium italic leading-relaxed mb-6 font-inter">
                    "{rev.comment}"
                  </p>
                </div>

                <div>
                  <p className="font-outfit uppercase font-bold text-xs text-text-primary dark:text-white mb-0.5">
                    {firstName} {lastName}
                  </p>
                  <span className="text-[10px] text-accent uppercase font-bold tracking-widest font-outfit">
                    Verified Buyer
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
