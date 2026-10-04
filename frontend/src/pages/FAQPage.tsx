import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  q: string;
  a: string;
  category: string;
}

const faqs: FAQ[] = [
  { category: 'Sizing', q: 'How do VIMSA oversized garments fit?', a: 'Our oversized products are designed to fit boxy with dropped shoulders. We recommend buying your regular size. Refer to our Size Guide for measurements.' },
  { category: 'Shipping', q: 'What is the delivery timeline for Sri Lanka?', a: 'We offer specialized delivery around Bogawanthalawa, Sri Lanka. Delivery addresses elsewhere are negotiable. Standard outstation deliveries take 3-5 business days. Free delivery applies for purchases above Rs. 15,000.' },
  { category: 'Payments', q: 'What payment methods does VIMSA support?', a: 'We accept local payment channels via PayHere, PayPal wallets, and Cash on Delivery (COD).' }
];

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="faq-accordions-page">
      <div className="text-center mb-16">
        <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-2 block">
          Support Center
        </span>
        <h1 className="text-2xl md:text-4xl font-outfit uppercase font-extrabold tracking-wider text-text-primary dark:text-white">
          Frequently Asked Questions
        </h1>
        <div className="w-12 h-[2px] bg-accent mx-auto mt-4" />
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border overflow-hidden">
              <button
                onClick={() => toggle(index)}
                className="w-full text-left px-6 py-4 flex justify-between items-center font-outfit uppercase text-xs tracking-wider font-bold text-text-primary dark:text-white"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-accent" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>
              
              {isOpen && (
                <div className="px-6 pb-5 text-xs text-text-secondary dark:text-gray-400 font-inter leading-relaxed normal-case">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQPage;
