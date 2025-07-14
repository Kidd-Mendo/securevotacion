
import { useTranslation } from "@/lib/useTranslation";

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t.errors.pageNotFound}</h1>
        <p className="text-muted-foreground mb-4">{t.errors.pageNotFoundDescription}</p>
        <a 
          href="/" 
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t.common.backToHome}
        </a>
      </div>
    </div>
  );
}
