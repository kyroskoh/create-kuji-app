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
          <Link to="/demo" className="block w-full">
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
              🎮 Try Live Demo
            </button>
          </Link>
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