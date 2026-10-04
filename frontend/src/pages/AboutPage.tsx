import React from 'react';
import BrandStory from '../components/home/BrandStory.tsx';
import TrustBadges from '../components/home/TrustBadges.tsx';

const AboutPage: React.FC = () => {
  return (
    <div id="about-us-page">
      {/* Header Banner */}
      <div className="bg-black text-white py-24 border-b border-accent/20 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
          <span className="font-outfit uppercase tracking-widest text-[10px] text-accent font-bold mb-3 block">
            About VIMSA
          </span>
          <h1 className="text-3xl md:text-5xl font-outfit uppercase font-extrabold tracking-wider mb-6">
            The Craft of Streetwear
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 font-inter max-w-xl mx-auto leading-relaxed font-semibold">
            VIMSA was established in Colombo with the singular mandate to design high-quality, heavy-fabric items that prioritize drapes and shapes.
          </p>
        </div>
      </div>

      <BrandStory />
      <TrustBadges />
    </div>
  );
};

export default AboutPage;
