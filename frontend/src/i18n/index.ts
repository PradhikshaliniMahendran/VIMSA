import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import si from './si.json';
import ta from './ta.json';

const savedLang = localStorage.getItem('vimsa_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      si: { translation: si },
      ta: { translation: ta },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
