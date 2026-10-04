import React from 'react';
import { Calendar, User } from 'lucide-react';

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  gradient: string;
}

const blogs: BlogPost[] = [
  {
    title: 'The Evolution of Modern Streetwear',
    excerpt: 'How boxy, oversized fits transitioned from skater subcultures into the upper echelons of luxury design.',
    date: 'June 01, 2026',
    category: 'Fashion Advice',
    gradient: 'from-[#0F0E0D] to-[#2E2822]'
  },
  {
    title: 'The Art of Heavyweight Fabric GSMs',
    excerpt: 'Why 450GSM combed cotton is the golden standard for structural silhouettes and drapes.',
    date: 'May 28, 2026',
    category: 'Behind The Scenes',
    gradient: 'from-[#0D0F0E] to-[#222A2E]'
  }
];

const BlogPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="blog-listing-page">
      <div className="text-center mb-16">
        <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-2 block">
          Editorial Insights
        </span>
        <h1 className="text-2xl md:text-4xl font-outfit uppercase font-extrabold tracking-wider text-text-primary dark:text-white">
          VIMSA Magazine
        </h1>
        <div className="w-12 h-[2px] bg-accent mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {blogs.map((post, idx) => (
          <div key={idx} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border overflow-hidden">
            {/* Visual gradient backdrop */}
            <div className={`h-60 bg-gradient-to-tr ${post.gradient} flex items-center justify-center`} />
            
            <div className="p-6 space-y-4 text-xs font-outfit uppercase tracking-wider font-semibold text-text-primary dark:text-white">
              <span className="text-[10px] text-accent font-extrabold">{post.category}</span>
              <h3 className="text-base font-extrabold tracking-wide normal-case">{post.title}</h3>
              <p className="text-[11px] text-text-secondary dark:text-gray-400 font-medium normal-case leading-relaxed font-inter">
                {post.excerpt}
              </p>
              
              <div className="flex items-center space-x-4 border-t border-gray-50 dark:border-dark-border pt-4 text-[9px] text-neutral-400 font-bold">
                <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5 text-accent" /> <span>{post.date}</span></span>
                <span className="flex items-center space-x-1"><User className="w-3.5 h-3.5 text-accent" /> <span>By VIMSA Studio</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
