import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Language = 'en' | 'si' | 'ta';
export type Currency = 'LKR' | 'USD';

interface UIState {
  theme: 'light' | 'dark';
  language: Language;
  currency: Currency;
  currencyRate: number; // LKR to USD conversion rate (e.g., 300)
  searchBarOpen: boolean;
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('vimsa_theme') as 'light' | 'dark';
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return 'light';
};

const initialState: UIState = {
  theme: getInitialTheme(),
  language: (localStorage.getItem('vimsa_lang') as Language) || 'en',
  currency: (localStorage.getItem('vimsa_currency') as Currency) || 'LKR',
  currencyRate: 300, // 1 USD = 300 LKR
  searchBarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('vimsa_theme', state.theme);
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('vimsa_theme', action.payload);
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      localStorage.setItem('vimsa_lang', action.payload);
    },
    setCurrency: (state, action: PayloadAction<Currency>) => {
      state.currency = action.payload;
      localStorage.setItem('vimsa_currency', action.payload);
    },
    setSearchBarOpen: (state, action: PayloadAction<boolean>) => {
      state.searchBarOpen = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, setLanguage, setCurrency, setSearchBarOpen } = uiSlice.actions;
export default uiSlice.reducer;
