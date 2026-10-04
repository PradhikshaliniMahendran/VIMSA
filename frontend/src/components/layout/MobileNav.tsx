import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/index.ts';
import { setLanguage, setCurrency, Language, Currency } from '../../store/slices/uiSlice.ts';
import logoPng from '../../assets/logo.png';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { i18n } = useTranslation();
  const currentLang = useSelector((state: RootState) => state.ui.language);
  const currentCurrency = useSelector((state: RootState) => state.ui.currency);

  if (!isOpen) return null;

  const handleLanguageChange = (lang: Language) => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  const handleCurrencyChange = (curr: Currency) => {
    dispatch(setCurrency(curr));
  };

  const getLinkStyle = (path: string, exactQuery?: string) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;

    let isActive = false;
    if (path === '/') {
      isActive = currentPath === '/';
    } else if (path === '/shop') {
      if (!exactQuery) {
        isActive = currentPath === '/shop' && !currentSearch.includes('type=');
      } else if (exactQuery === 'DRESS') {
        isActive = currentPath === '/shop' && currentSearch.includes('type=DRESS');
      } else if (exactQuery === 'PLASTIC') {
        isActive = currentPath === '/shop' && currentSearch.includes('type=PLASTIC');
      }
    } else {
      isActive = currentPath.startsWith(path);
    }

    return `block text-lg font-outfit uppercase font-semibold tracking-widest py-3 border-b border-gray-100 dark:border-dark-border hover:text-accent transition-colors duration-200 ${
      isActive ? 'text-accent font-bold pl-2 border-l-4 border-l-accent' : 'text-text-primary dark:text-white'
    }`;
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-in sidebar menu */}
      <div className="relative w-4/5 max-w-sm bg-white dark:bg-dark-surface h-full flex flex-col p-6 shadow-2xl transition-transform duration-300 z-10 flex-grow scrollbar-none">
        {/* Header containing Logo and Close Button */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/" onClick={onClose} className="flex items-center">
            <img src={logoPng} alt="VIMSA Logo" className="h-8 w-auto" />
            <span className="ml-2 font-outfit uppercase tracking-widest font-extrabold text-sm text-text-primary dark:text-white">
              VIMSA
            </span>
          </Link>
          <button
            onClick={onClose}
            className="text-text-primary dark:text-white hover:text-accent transition-colors duration-200"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-grow overflow-y-auto">
          <Link to="/" onClick={onClose} className={getLinkStyle('/')}>Home</Link>
          <Link to="/shop" onClick={onClose} className={getLinkStyle('/shop')}>Shop</Link>
          <Link to="/about" onClick={onClose} className={getLinkStyle('/about')}>About</Link>
          <Link to="/contact" onClick={onClose} className={getLinkStyle('/contact')}>Contact</Link>
        </div>

        {/* Footers of Mobile Navigation (Lang, Currency) */}
        <div className="border-t border-gray-100 dark:border-dark-border pt-6 mt-auto flex flex-col space-y-4">
          {/* Currency Toggle */}
          <div>
            <span className="font-outfit uppercase text-[10px] text-text-secondary dark:text-gray-400 font-bold tracking-widest block mb-2">
              Currency
            </span>
            <div className="flex items-center space-x-2">
              {(['LKR', 'USD'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => handleCurrencyChange(curr)}
                  className={`px-3 py-1 text-xs font-outfit font-semibold border ${
                    currentCurrency === curr
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                      : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-white'
                  } rounded`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Language Toggle */}
          <div>
            <span className="font-outfit uppercase text-[10px] text-text-secondary dark:text-gray-400 font-bold tracking-widest block mb-2">
              Language
            </span>
            <div className="flex items-center space-x-2">
              {(['en', 'si', 'ta'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1 text-xs font-outfit uppercase font-semibold border ${
                    currentLang === lang
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                      : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-white'
                  } rounded`}
                >
                  {lang === 'en' ? 'EN' : lang === 'si' ? 'SI' : 'TA'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
