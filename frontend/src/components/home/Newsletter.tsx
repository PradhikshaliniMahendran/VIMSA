import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button.tsx';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Successfully subscribed to the VIMSA Newsletter! Check your inbox.');
      setEmail('');
    }, 1000);
  };

  return (
    <section className="py-24 bg-black text-white relative overflow-hidden" id="home-newsletter">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent_60%)]" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4 block animate-fade-in">
          Join the VIMSA Circle
        </span>
        <h2 className="text-3xl md:text-5xl font-outfit uppercase font-extrabold tracking-wider mb-6">
          Unlock Early Releases
        </h2>
        <p className="text-xs md:text-sm text-neutral-400 font-inter max-w-lg mx-auto mb-10 leading-relaxed font-semibold">
          Subscribe to receive private sale drops, restock updates, design walkthroughs, and custom discounts before anyone else.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ENTER YOUR EMAIL ADDRESS"
            className="flex-grow bg-neutral-900 border border-neutral-800 text-xs text-white px-4 py-3 outline-none tracking-widest uppercase font-outfit focus:border-accent text-center sm:text-left"
            required
          />
          <Button variant="accent" size="md" isLoading={loading} className="sm:px-8">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
