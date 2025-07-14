import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ReturnType<typeof getTranslation>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sistema-votacion-language');
      return (stored as Language) || 'es';
    }
    return 'es';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sistema-votacion-language', newLanguage);
    }
  };

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}