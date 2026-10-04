import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Instagram, Facebook, Youtube, PhoneCall } from 'lucide-react';
import logoPng from '../../assets/logo.png';
import toast from 'react-hot-toast';
import { useStoreSettings } from '../../hooks/useStoreSettings.ts';

const Footer: React.FC = () => {
  const { cleanWhatsappNumber, facebookUrl, instagramUrl } = useStoreSettings();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    // Mimic newsletter subscription api call
    setTimeout(() => {
      setLoading(false);
      toast.success('Thank you for subscribing to VIMSA Elite Club!');
      setEmail('');
    }, 1000);
  };

  return (
    <footer className="bg-black text-white border-t border-accent/20 pt-16 pb-8" id="premium-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand details */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center mb-4">
            <img src={logoPng} alt="VIMSA Logo" className="h-24 w-auto" />
            <span className="ml-2 font-outfit uppercase tracking-widest font-extrabold text-2xl text-white">
              VIMSA
            </span>
          </Link>
          <p className="text-xs text-neutral-400 font-inter leading-relaxed max-w-sm mb-6">
            An premium luxury streetwear and fashion brand. Combining heavyweight fabrics, high-quality craftmanship, and minimalist gold aesthetics to create unique silhouettes.
          </p>
          {/* Social connections */}
          <div className="flex space-x-4">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-neutral-800 hover:border-accent hover:text-accent transition-colors duration-300">
              <Instagram className="w-4 h-4" />
            </a>
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-neutral-800 hover:border-accent hover:text-accent transition-colors duration-300">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-neutral-800 hover:border-accent hover:text-accent transition-colors duration-300">
              <Youtube className="w-4 h-4" />
            </a>
            <a href={`https://wa.me/${cleanWhatsappNumber}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-neutral-800 hover:border-accent hover:text-accent transition-colors duration-300" title="Contact on WhatsApp">
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Link Column 1: Shop */}
        <div>
          <h4 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4">Shop Category</h4>
          <ul className="space-y-2 text-xs text-neutral-400 font-semibold font-outfit">
            <li><Link to="/shop?category=oversized-t-shirts" className="hover:text-white transition-colors">Oversized Tees</Link></li>
            <li><Link to="/shop?category=hoodies-sweatshirts" className="hover:text-white transition-colors">Heavyweight Hoodies</Link></li>
            <li><Link to="/shop?category=cargo-pants" className="hover:text-white transition-colors">Utility Cargos</Link></li>
            <li><Link to="/shop?category=men" className="hover:text-white transition-colors">Mens Apparel</Link></li>
            <li><Link to="/shop?category=women" className="hover:text-white transition-colors">Womens Luxury</Link></li>
          </ul>
        </div>

        {/* Link Column 2: Assistance */}
        <div>
          <h4 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4">Support</h4>
          <ul className="space-y-2 text-xs text-neutral-400 font-semibold font-outfit">
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors">F.A.Qs</Link></li>
            <li><Link to="/order-tracking" className="hover:text-white transition-colors">Track Order</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Info</Link></li>
            <li><Link to="/return-policy" className="hover:text-white transition-colors">Returns & Claims</Link></li>
          </ul>
        </div>

        {/* Link Column 3: Subscription Panel */}
        <div className="flex flex-col">
          <h4 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4">Newsletter</h4>
          <p className="text-xs text-neutral-400 mb-4 leading-relaxed font-semibold font-outfit">
            Subscribe for early drops, exclusive private sales, and limited product alerts.
          </p>
          <form onSubmit={handleSubscribe} className="flex relative items-center border-b border-neutral-800 pb-2">
            <input
              type="email"
              placeholder="YOUR EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-none w-full text-xs text-white placeholder-neutral-600 outline-none uppercase font-outfit tracking-wider"
              required
            />
            <button type="submit" disabled={loading} className="text-neutral-400 hover:text-accent transition-colors">
              <Mail className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Copyright area with accepted cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p className="text-[10px] text-neutral-500 font-semibold tracking-wider font-outfit">
          &copy; {new Date().getFullYear()} VIMSA CLOTHING. ALL RIGHTS RESERVED. DESIGNED WITH GOLD ACCENTS.
        </p>
        {/* Payment badges */}
        <div className="flex items-center space-x-3 text-neutral-500 text-xs font-outfit uppercase font-semibold">
          <span>WhatsApp Direct Order</span>
          <span className="text-accent">•</span>
          <span>Cash / Direct Dispatch</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
