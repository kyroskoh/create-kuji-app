import DrawScreen from "../components/Draw/DrawScreen.jsx";
import { useTranslation } from "../utils/TranslationContext.jsx";

export default function Draw() {
  const { t } = useTranslation();
  
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">{t("draw.title")}</h2>
        <p className="text-sm text-slate-400">
          {t("draw.description") || "Confirm offline payments, choose draw presets, and reveal prizes with delightful animations."}
        </p>
      </header>
      <DrawScreen />
    </section>
  );
}