import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Sun, Moon, Globe, Menu } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/index.ts';
import { setSearchBarOpen, setLanguage, setCurrency, Language, Currency } from '../../store/slices/uiSlice.ts';
import { toggleCartDrawer } from '../../store/slices/cartSlice.ts';
import { useCart } from '../../hooks/useCart.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { useTheme } from '../../hooks/useTheme.ts';
import logoPng from '../../assets/logo.png';
import MobileNav from './MobileNav.tsx';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { cartItemsCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggle } = useTheme();
  
  const wishlistIds = useSelector((state: RootState) => state.wishlist.productIds);
  const currentLang = useSelector((state: RootState) => state.ui.language);
  const currentCurrency = useSelector((state: RootState) => state.ui.currency);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Monitor scroll height to trigger glassmorphism styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    dispatch(setLanguage(lang));
  };

  const handleCurrencyChange = (curr: Currency) => {
    dispatch(setCurrency(curr));
  };

  const handleLogout = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    navigate('/');
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

    return `font-outfit uppercase font-semibold text-xs tracking-widest relative py-2 transition-colors duration-300 hover:text-accent ${
      isActive ? 'text-accent border-b-2 border-accent font-bold' : 'text-text-primary dark:text-white'
    }`;
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-border py-3 shadow-sm'
            : 'bg-transparent py-5'
        }`}
        id="main-navbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Mobile hamburger menu */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-text-primary dark:text-white"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Nav Brand Logo */}
          <Link to="/" className="flex items-center flex-grow md:flex-grow-0 justify-center md:justify-start">
            <img src={logoPng} alt="VIMSA Logo" className="h-8 md:h-10 w-auto" />
            <span className="ml-2 font-outfit uppercase tracking-widest font-extrabold text-sm hidden sm:inline text-text-primary dark:text-white">
              VIMSA
            </span>
          </Link>

          {/* Navigation Links Desktop */}
          <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
            <Link to="/" className={getLinkStyle('/')}>Home</Link>
            <Link to="/shop" className={getLinkStyle('/shop')}>Shop</Link>
            <Link to="/about" className={getLinkStyle('/about')}>About</Link>
            <Link to="/contact" className={getLinkStyle('/contact')}>Contact</Link>
          </div>

          {/* Interactive Utility Controls */}
          <div className="flex items-center space-x-4">
            {/* Search Trigger */}
            <button
              onClick={() => dispatch(setSearchBarOpen(true))}
              className="text-text-primary dark:text-white hover:text-accent transition-colors duration-200"
              aria-label="Search clothing"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Currency Selector (Desktop) */}
            <div className="hidden lg:flex items-center space-x-1 font-outfit text-xs font-semibold text-text-primary dark:text-white">
              <button
                onClick={() => handleCurrencyChange('LKR')}
                className={`px-1.5 py-0.5 rounded transition-colors ${currentCurrency === 'LKR' ? 'bg-black text-white dark:bg-white dark:text-black' : ''}`}
              >
                LKR
              </button>
              <button
                onClick={() => handleCurrencyChange('USD')}
                className={`px-1.5 py-0.5 rounded transition-colors ${currentCurrency === 'USD' ? 'bg-black text-white dark:bg-white dark:text-black' : ''}`}
              >
                USD
              </button>
            </div>

            {/* Language Selector Selector (Desktop) */}
            <div className="hidden lg:relative group/lang items-center">
              <button className="flex items-center space-x-1 text-text-primary dark:text-white hover:text-accent font-outfit text-xs font-semibold">
                <Globe className="w-4 h-4" />
                <span className="uppercase">{currentLang}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-24 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border opacity-0 pointer-events-none group-hover/lang:opacity-100 group-hover/lang:pointer-events-auto transition-all duration-300 shadow-md">
                {(['en', 'si', 'ta'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-outfit uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800 ${currentLang === lang ? 'text-accent font-bold' : 'text-text-primary dark:text-white'}`}
                  >
                    {lang === 'en' ? 'EN' : lang === 'si' ? 'SI' : 'TA'}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="text-text-primary dark:text-white hover:text-accent transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist Link with Badge */}
            <Link
              to="/wishlist"
              className="relative text-text-primary dark:text-white hover:text-accent transition-colors duration-200"
              aria-label="Wishlist items"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-black text-[9px] font-outfit font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => dispatch(toggleCartDrawer())}
              className="relative text-text-primary dark:text-white hover:text-accent transition-colors duration-200"
              aria-label="Cart drawer"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white dark:bg-white dark:text-black border border-accent text-[9px] font-outfit font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile nav Drawer */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};

export default Navbar;
