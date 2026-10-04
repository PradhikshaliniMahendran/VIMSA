import React from 'react';

interface StrictNumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  maxLength?: number;
  onValueChange?: (value: string) => void;
  error?: string;
  label?: string;
}

export const StrictNumberInput = React.forwardRef<HTMLInputElement, StrictNumberInputProps>(
  ({ maxLength = 10, onValueChange, error, label, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-outfit uppercase tracking-widest font-bold text-text-primary dark:text-white mb-2">
            {label}
          </label>
        )}
        <input
          {...props}
          ref={ref}
          type="number"
          className={`w-full px-4 py-3 bg-transparent border ${
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-200 dark:border-dark-border focus:border-accent'
          } outline-none transition-colors duration-200 font-inter text-text-primary dark:text-white ${className}`}
          style={{ MozAppearance: 'textfield' }} // hide arrows in firefox inline
          onKeyDown={(e) => {
            // Block 'e', 'E', '+', '-', '.' which are technically valid in type="number" but not in phone numbers
            if (['e', 'E', '+', '-', '.'].includes(e.key)) {
              e.preventDefault();
            }
            props.onKeyDown?.(e);
          }}
          onInput={(e) => {
            const el = e.currentTarget;
            let val = el.value.replace(/\D/g, ''); // Ensure only digits
            if (maxLength && val.length > maxLength) {
              val = val.slice(0, maxLength);
            }
            el.value = val;
            onValueChange?.(val);
            props.onInput?.(e);
          }}
        />
        {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
