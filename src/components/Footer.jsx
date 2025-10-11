export default function Footer({ variant = "default" }) {
  const currentYear = new Date().getFullYear();
  
  if (variant === "minimal") {
    // Minimal variant for login/signup pages
    return (
      <footer className="mt-8 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <span>© {currentYear}</span>
            <a 
              href="https://CreateKuji.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              CreateKuji.app
            </a>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <div className="flex items-center gap-1">
            <span>Developed by</span>
            <span className="font-semibold text-slate-400">Kyros Koh</span>
          </div>
        </div>
      </footer>
    );
  }
  
  // Default variant for main layout
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950/50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span>© {currentYear}</span>
            <a 
              href="https://CreateKuji.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-create-primary hover:text-create-primary/80 transition-colors"
            >
              CreateKuji.app
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span>Developed by</span>
            <span className="font-semibold text-slate-300">Kyros Koh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
