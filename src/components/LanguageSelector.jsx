import { SUPPORTED_LANGUAGES } from '../utils/i18n.js';
import { useTranslation } from '../utils/TranslationContext.jsx';

export default function LanguageSelector() {
  const { currentLang, changeLanguage, t } = useTranslation();
  
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    if (changeLanguage(newLang)) {
      // Force reload to apply language changes throughout the app
      window.location.reload();
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
        value={currentLang}
        onChange={handleLanguageChange}
        aria-label={t("settings.language")}
      >
        {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}