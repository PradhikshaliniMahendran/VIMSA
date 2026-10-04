import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col mb-4">
        {label && (
          <label className="text-xs uppercase font-outfit tracking-wider font-semibold mb-1.5 text-text-primary dark:text-gray-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-sm px-4 py-2.5 outline-none transition-all duration-300 focus:border-accent dark:focus:border-accent text-text-primary dark:text-gray-100 ${
            error ? 'border-error focus:border-error dark:focus:border-error' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-error font-medium mt-1">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-text-secondary dark:text-gray-400 mt-1">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
