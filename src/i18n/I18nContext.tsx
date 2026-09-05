"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en, TranslationKey } from "./dictionaries/en";
import { mr } from "./dictionaries/mr";

export type Language = "en" | "mr";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("mr"); // Default to Marathi for cultural authenticity

  useEffect(() => {
    const saved = localStorage.getItem("mandal_lang") as Language;
    if (saved === "en" || saved === "mr") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("mandal_lang", lang);
    document.cookie = `mandal_lang=${lang}; path=/; max-age=31536000`;
  };

  const t = (key: TranslationKey): string => {
    if (language === "mr") {
      return mr[key] || en[key] || key;
    }
    return en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
