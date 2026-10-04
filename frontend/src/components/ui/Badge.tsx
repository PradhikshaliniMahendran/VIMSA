import React from 'react';

interface BadgeProps {
  variant?: 'new' | 'sale' | 'trending' | 'hot' | 'soldout' | 'info';
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  className = '',
}) => {
  const styles = {
    new: 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white',
    sale: 'bg-error text-white border border-error',
    trending: 'bg-accent text-black border border-accent font-semibold',
    hot: 'bg-warning text-black border border-warning font-semibold',
    soldout: 'bg-gray-400 text-white border border-gray-400 dark:bg-gray-800 dark:border-gray-800',
    info: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
  };

  return (
    <span
      className={`inline-flex items-center text-[10px] font-outfit uppercase tracking-widest px-2.5 py-0.5 font-bold ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
