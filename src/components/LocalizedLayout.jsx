import { useEffect } from 'react';
import useTranslation from '../utils/useTranslation.js';
import { initLanguage } from '../utils/i18n.js';

export default function LocalizedLayout({ children }) {
  const { currentLang } = useTranslation();
  
  useEffect(() => {
    // Initialize language on component mount
    initLanguage();
    
    // Update document language attribute
    document.documentElement.lang = currentLang;
  }, [currentLang]);
  
  return (
    <div className="min-h-screen bg-slate-900">
      {children}
    </div>
  );
}