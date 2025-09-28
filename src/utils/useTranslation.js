import { useState, useEffect } from 'react';
import { translate, setLanguage } from './i18n';

export default function useTranslation() {
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('language') || 'en');
  
  useEffect(() => {
    // Listen for language changes in localStorage
    const handleStorageChange = () => {
      const storedLang = localStorage.getItem('language');
      if (storedLang && storedLang !== currentLang) {
        setCurrentLang(storedLang);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentLang]);
  
  const t = (key) => translate(key, currentLang);
  
  const changeLanguage = (lang) => {
    if (setLanguage(lang)) {
      setCurrentLang(lang);
      return true;
    }
    return false;
  };
  
  return { t, currentLang, changeLanguage };
}