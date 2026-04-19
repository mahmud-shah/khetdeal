import { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en';
import bn from '../i18n/bn';

const LangCtx = createContext();
const dict = { en, bn };

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('kd-lang') || 'en');

  useEffect(() => {
    localStorage.setItem('kd-lang', lang);
    document.body.classList.toggle('lang-bn', lang === 'bn');
  }, [lang]);

  const t = (key) => dict[lang]?.[key] || dict.en[key] || key;
  const toggle = () => setLang((p) => (p === 'en' ? 'bn' : 'en'));

  return <LangCtx.Provider value={{ lang, t, toggle }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);