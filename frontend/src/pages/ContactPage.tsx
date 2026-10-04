import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input.tsx';
import Button from '../components/ui/Button.tsx';
import api from '../services/api.ts';
import { useStoreSettings } from '../hooks/useStoreSettings.ts';

const ContactPage: React.FC = () => {
  const { contactNumber, email: storeEmail, address: storeAddress, cleanWhatsappNumber } = useStoreSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSending(true);
    try {
      const { data } = await api.post('/public/contact', {
        name,
        email,
        subject: 'General Enquiry',
        message
      });
      if (data.success) {
        toast.success('Your message has been sent successfully! We will contact you soon.');
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch (err) {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="contact-us-page">
      {/* Banner */}
      <div className="bg-black text-white py-20 border-b border-accent/20 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
          <span className="font-outfit uppercase tracking-widest text-[10px] text-accent font-bold mb-3 block">
            Get in Touch
          </span>
          <h1 className="text-3xl md:text-5xl font-outfit uppercase font-extrabold tracking-wider mb-4">
            Contact VIMSA
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 font-inter max-w-lg mx-auto font-semibold leading-relaxed">
            Reach out regarding order status, custom sizing adjustments, or private brand drops.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 font-outfit uppercase tracking-wider text-xs font-semibold text-text-primary dark:text-white">
        {/* Info Column */}
        <div className="space-y-8 pr-6">
          <div>
            <h3 className="font-outfit text-accent text-sm font-bold mb-4">Corporate Office</h3>
            <p className="text-xs text-text-secondary dark:text-gray-400 normal-case leading-relaxed font-semibold">
              Get in touch with VIMSA Clothing for sizing, order tracking, and fitting sessions.
            </p>
          </div>

          <div className="space-y-4 text-xs font-semibold font-outfit">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-accent" />
              <span>{storeAddress}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-accent" />
              <a href={`https://wa.me/${cleanWhatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                {contactNumber} (WhatsApp Available)
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-accent" />
              <span className="normal-case">{storeEmail}</span>
            </div>

            {/* Delivery Info */}
            <div className="pt-4 border-t border-gray-100 dark:border-dark-border space-y-2 mt-4">
              <span className="font-extrabold text-[10px] text-accent tracking-widest block uppercase">Delivery Information</span>
              <p className="text-text-secondary dark:text-gray-400 normal-case leading-relaxed font-normal">
                📍 Specialized delivery is available around {storeAddress}.
              </p>
              <p className="text-text-secondary dark:text-gray-400 normal-case leading-relaxed font-normal">
                🤝 Delivery addresses elsewhere are fully negotiable. Contact us to coordinate shipping.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-8 shadow-sm">
          <h3 className="font-outfit text-accent text-sm font-bold mb-6">Send Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            
            <div className="flex flex-col">
              <label className="text-xs uppercase font-semibold mb-1.5">Message Content</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="bg-transparent border border-gray-300 dark:border-dark-border text-xs px-3 py-2 outline-none uppercase font-outfit focus:border-accent text-text-primary dark:text-white"
                required
              />
            </div>

            <Button type="submit" variant="primary" fullWidth isLoading={sending}>
              <Send className="w-4 h-4 mr-2" />
              <span>Submit Message</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
