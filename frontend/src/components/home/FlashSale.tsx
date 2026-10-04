import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../ui/Button.tsx';
import { settingsService, GlobalSettings } from '../../services/settingsService.ts';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const FlashSale: React.FC = () => {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  // Default target date to 7 days in the future if settings not loaded yet
  const [targetDate, setTargetDate] = useState<number>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.getTime();
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsService.getSettings();
        if (res.success && res.data) {
          setSettings(res.data);
          if (res.data.flashSaleEndDate) {
            setTargetDate(new Date(res.data.flashSaleEndDate).getTime());
          }
        }
      } catch (err) {
        console.error("Failed to load flash sale settings");
      }
    };
    fetchSettings();
  }, []);

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timerItems = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  // Hide the entire banner if the flash sale is marked as inactive
  if (settings && !settings.flashSaleActive) {
    return null;
  }

  return (
    <section className="py-20 bg-black text-white relative overflow-hidden border-y border-accent/30" id="flash-sale-banner">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.08),transparent_40%)]" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
        {/* Left column details */}
        <div className="text-center lg:text-left max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4 block"
          >
            Limited Offer
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-outfit uppercase font-extrabold tracking-wider mb-6"
          >
            {settings?.flashSaleTitle || 'VIMSA Flash Sale'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs md:text-sm text-neutral-400 font-inter leading-relaxed mb-8"
          >
            Get up to <span className="text-white font-bold">{settings?.flashSaleDiscountText || '30% OFF'}</span> on selected oversized streetwear hoodies, heavyweight cotton tees, and utility cargos. Sizes are extremely limited.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/flash-sales">
              <Button variant="accent" size="lg">
                Shop The Sale Now
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right column: Countdown timer display */}
        <div className="flex flex-col items-center">
          <span className="font-outfit uppercase text-[10px] text-accent tracking-widest font-extrabold mb-4">
            Offer Ends In
          </span>
          <div className="flex space-x-4 md:space-x-6">
            {timerItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-900 border border-accent/20 flex items-center justify-center rounded-sm shadow-xl mb-2">
                  <span className="font-outfit font-extrabold text-2xl md:text-3xl text-white">
                    {String(item.value).padStart(2, '0')}
                  </span>
                </div>
                <span className="font-outfit uppercase text-[9px] text-neutral-500 font-bold tracking-widest">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
