import { Link } from "react-router-dom";
import { useTranslation } from "../utils/TranslationContext.jsx";

export default function Home() {
  const { t } = useTranslation();
  
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-4xl font-bold text-white">{t("app.title")}</h1>
        <p className="text-slate-300">
          {t("home.description")}
        </p>
        <div className="flex flex-col gap-4 pt-4">
          <Link to="/draw" className="block w-full">
            <button className="w-full">{t("home.startDrawing")}</button>
          </Link>
          <Link to="/admin" className="block w-full">
            <button className="w-full bg-slate-700 hover:bg-slate-600">
              {t("home.adminArea")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}