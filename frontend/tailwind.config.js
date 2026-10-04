/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#D4AF37',
        'accent-light': '#F0D060',
        background: '#F8F8F8',
        'text-primary': '#111111',
        'text-secondary': '#666666',
        success: '#16A34A',
        error: '#DC2626',
        warning: '#F59E0B',
        'dark-bg': '#0A0A0A',
        'dark-surface': '#111111',
        'dark-border': '#2A2A2A',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { opacity: '1' } },
        slideInRight: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        pulseGold: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.4)' }, '50%': { boxShadow: '0 0 0 10px rgba(212,175,55,0)' } },
      },
    },
  },
  plugins: [],
};
