import React from 'react';
import LoadingSpinner from './LoadingSpinner.tsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'text' | 'error';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-outfit uppercase tracking-wider font-semibold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-black text-white border border-black hover:bg-accent hover:border-accent',
    secondary: 'bg-transparent text-black border border-black hover:bg-black hover:text-white dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black',
    accent: 'bg-accent text-black border border-accent hover:bg-black hover:text-white hover:border-black dark:hover:border-white',
    text: 'bg-transparent text-black dark:text-white hover:text-accent dark:hover:text-accent p-0',
    error: 'bg-red-600 text-white border border-red-600 hover:bg-red-700'
  };

  const sizes = {
    sm: 'text-xs px-4 py-2',
    md: 'text-sm px-6 py-3',
    lg: 'text-base px-8 py-4',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
