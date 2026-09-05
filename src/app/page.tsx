"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/i18n/I18nContext";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import {
  IndianRupee,
  ReceiptText,
  Users,
  Building2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const { t, language } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Navigation Topbar */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-orange-950/50">
            ॐ
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-orange-400">
              {t("app_name")}
            </h1>
            <p className="text-[11px] text-slate-400">
              {t("ganesh_invocation")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>{t("sign_in")}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/60 border border-orange-800/60 text-orange-300 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Cloudflare D1 & Pages Powered • Multi-Tenant RBAC</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight sm:leading-tight">
          {language === "mr" ? (
            <>
              सार्वजनिक गणेशोत्सवाचे <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                आधुनिक व पारदर्शक
              </span>{" "}
              व्यवस्थापन
            </>
          ) : (
            <>
              Next-Gen Multi-Tenant Portal for{" "}
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                Ganpati Festival Mandals
              </span>
            </>
          )}
        </h1>

        <p className="mt-6 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          {language === "mr"
            ? "वर्गणी पावती, दैनंदिन खर्च नोंद, कार्यकारणी सदस्य सूची आणि सुपर अ‍ॅडमिन बहु-मंडळ नियंत्रण – सर्व एकाच ठिकाणी, मराठी आणि इंग्रजीत."
            : "Effortlessly manage Vargani donations, track daily expenditures, organize committee members, and generate instant printable bilingual receipts."}
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-orange-950/60 transition-all flex items-center justify-center gap-2"
          >
            <span>{language === "mr" ? "पोर्टलमध्ये प्रवेश करा" : "Enter Management Portal"}</span>
            <ChevronRight className="w-5 h-5" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm sm:text-base rounded-xl transition-all"
          >
            {t("quick_demo_login")}
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left w-full">
          <div className="p-5 bg-slate-800/50 border border-slate-700/60 rounded-2xl hover:border-orange-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center mb-3">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">{t("nav_vargani")}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {language === "mr"
                ? "कबूल केलेली रक्कम, प्रत्यक्ष जमा व उर्वरित शिल्लक आणि त्वरित डिजिटल पावती."
                : "Track pledged vs collected funds, pending balances, and instant printable receipts."}
            </p>
          </div>

          <div className="p-5 bg-slate-800/50 border border-slate-700/60 rounded-2xl hover:border-orange-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center mb-3">
              <ReceiptText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">{t("nav_expenses")}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {language === "mr"
                ? "मंडप, रोषणाई, वाद्य, महाप्रसाद आणि सुरक्षेचा दैनिक खर्च वर्गवारीनुसार."
                : "Record vouchers across categories with vendor details, modes, and notes."}
            </p>
          </div>

          <div className="p-5 bg-slate-800/50 border border-slate-700/60 rounded-2xl hover:border-orange-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">{t("nav_members")}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {language === "mr"
                ? "अध्यक्ष, सचिव, खजिनदार व कार्यकर्ते यांची संपूर्ण संपर्क व रक्तगट सूची."
                : "Organize office bearers, executive members, and volunteers with directory access."}
            </p>
          </div>

          <div className="p-5 bg-slate-800/50 border border-slate-700/60 rounded-2xl hover:border-orange-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">{t("nav_super_admin")}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {language === "mr"
                ? "सर्व मंडळांची मास्टर नोंदणी, प्रारंभिक क्रेडेंशियल्स व अ‍ॅक्टिव्ह/ब्लॉक नियंत्रण."
                : "Master multi-tenant registry, auto-generated admin credentials, and status toggles."}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          © 2026 {t("app_name")} • Optimized for Cloudflare Pages & D1
        </p>
        <div className="flex items-center gap-4 text-slate-400">
          <span>मराठी / English</span>
          <span>Role-Based Access Control</span>
        </div>
      </footer>
    </div>
  );
}
