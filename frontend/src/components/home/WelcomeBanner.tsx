import React from 'react';

const WelcomeBanner: React.FC = () => {
  return (
    <div className="w-full bg-[#050505] border-y border-accent/20 py-4 overflow-hidden select-none relative">
      {/* Background Subtle Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="flex whitespace-nowrap animate-marquee">
        {/* Carousel slide 1 */}
        <div className="flex space-x-16 shrink-0 items-center text-xs font-outfit uppercase tracking-[0.2em] text-white">
          <span className="hover:text-accent transition-colors duration-300">Welcome to VIMSA Family</span>
          <span className="text-accent">•</span>
          <span className="hover:text-accent transition-colors duration-300 font-medium">VIMSA පවුලට සාදරයෙන් පිළිගනිමු</span>
          <span className="text-accent">•</span>
          <span className="hover:text-accent transition-colors duration-300">VIMSA குடும்பத்திற்கு வரவேற்கிறோம்</span>
          <span className="text-accent">•</span>
        </div>
        {/* Carousel slide 2 (Duplicate for infinite looping scroll) */}
        <div className="flex space-x-16 shrink-0 items-center text-xs font-outfit uppercase tracking-[0.2em] text-white" aria-hidden="true">
          <span className="hover:text-accent transition-colors duration-300">Welcome to VIMSA Family</span>
          <span className="text-accent">•</span>
          <span className="hover:text-accent transition-colors duration-300 font-medium">VIMSA පවුලට සාදරයෙන් පිළිගනිමු</span>
          <span className="text-accent">•</span>
          <span className="hover:text-accent transition-colors duration-300">VIMSA குடும்பத்திற்கு வரவேற்கிறோம்</span>
          <span className="text-accent">•</span>
        </div>
        {/* Carousel slide 3 (Extra buffer) */}
        <div className="flex space-x-16 shrink-0 items-center text-xs font-outfit uppercase tracking-[0.2em] text-white" aria-hidden="true">
          <span className="hover:text-accent transition-colors duration-300">Welcome to VIMSA Family</span>
          <span className="text-accent">•</span>
          <span className="hover:text-accent transition-colors duration-300 font-medium">VIMSA පවුලට සාදරයෙන් පිළිගනිමු</span>
          <span className="text-accent">•</span>
          <span className="hover:text-accent transition-colors duration-300">VIMSA குடும்பத்திற்கு வரவேற்கிறோம்</span>
          <span className="text-accent">•</span>
        </div>
        {/* Carousel slide 4 (Extra buffer) */}
        <div className="flex space-x-16 shrink-0 items-center text-xs font-outfit uppercase tracking-[0.2em] text-white" aria-hidden="true">
          <span className="hover:text-accent transition-colors duration-300">Welcome to VIMSA Family</span>
          <span className="text-accent">•</span>
          <span className="hover:text-accent transition-colors duration-300 font-medium">VIMSA පවුලට සාදරයෙන් පිළිගනිමු</span>
          <span className="text-accent">•</span>
          <span className="hover:text-accent transition-colors duration-300">VIMSA குடும்பத்திற்கு வரவேற்கிறோம்</span>
          <span className="text-accent">•</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
