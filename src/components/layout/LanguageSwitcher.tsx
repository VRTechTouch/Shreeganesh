"use client";

import React from "react";
import { useTranslation, Language } from "@/i18n/I18nContext";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-xs text-xs font-semibold">
      <div className="flex items-center px-1.5 text-slate-500">
        <Languages className="w-3.5 h-3.5 mr-1" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage("mr")}
        className={`px-2.5 py-1 rounded transition-all ${
          language === "mr"
            ? "bg-orange-600 text-white font-bold shadow-xs"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        }`}
      >
        मराठी
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded transition-all ${
          language === "en"
            ? "bg-orange-600 text-white font-bold shadow-xs"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        }`}
      >
        EN
      </button>
    </div>
  );
}
