import React, { createContext, useContext, useState, useEffect } from 'react';
import { translate, setLanguage, initLanguage } from './i18n';

// Create a context for translations
const TranslationContext = createContext();

export function TranslationProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    // Initialize language on first render
    return initLanguage();
  });
  
  useEffect(() => {
    // Update document language attribute when language changes
    document.documentElement.lang = currentLang;
    
    // Listen for language changes in localStorage (for cross-tab synchronization)
    const handleStorageChange = (e) => {
      if (e.key === 'language') {
        const newLang = e.newValue;
        if (newLang && newLang !== currentLang) {
          setCurrentLang(newLang);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentLang]);
  
  // Translation function
  const t = (key) => translate(key, currentLang);
  
  // Function to change the current language
  const changeLanguage = (lang) => {
    if (setLanguage(lang)) {
      setCurrentLang(lang);
      return true;
    }
    return false;
  };
  
  const contextValue = {
    t,
    currentLang,
    changeLanguage
  };
  
  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

// Custom hook to use translations
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}