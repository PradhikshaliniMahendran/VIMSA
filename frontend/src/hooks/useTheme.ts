import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/index.ts';
import { toggleTheme, setTheme } from '../store/slices/uiSlice.ts';

export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggle = () => {
    dispatch(toggleTheme());
  };

  const setExplicitTheme = (newTheme: 'light' | 'dark') => {
    dispatch(setTheme(newTheme));
  };

  return {
    theme,
    isDark: theme === 'dark',
    toggle,
    setTheme: setExplicitTheme,
  };
};
