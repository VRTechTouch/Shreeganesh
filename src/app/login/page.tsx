"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/I18nContext";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { LogIn, ShieldAlert, Sparkles, Building2, UserCheck, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t, language } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (u?: string, p?: string) => {
    const userToLogin = u || username;
    const passToLogin = p || password;

    if (!userToLogin.trim() || !passToLogin.trim()) {
      setError(t("invalid_credentials"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userToLogin,
          password: passToLogin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("invalid_credentials"));
      }

      router.push(data.redirect || "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    handleLogin(demoUser, demoPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-slate-100 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-bold text-white text-lg shadow-md">
            ॐ
          </div>
          <div>
            <span className="font-extrabold text-slate-800 tracking-tight text-sm sm:text-base">
              {t("app_name")}
            </span>
            <span className="block text-[10px] text-orange-700 font-semibold tracking-wider">
              {t("ganesh_invocation")}
            </span>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-amber-100/80 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 text-white text-center relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md mb-3 shadow-inner border border-white/20 text-2xl font-bold">
              ॐ
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {t("login_title")}
            </h2>
            <p className="text-xs text-orange-100 mt-1 max-w-xs mx-auto leading-relaxed">
              {t("login_subtitle")}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("username")}
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. mandaladmin / superadmin"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-hidden transition-all bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("password")}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-hidden transition-all bg-slate-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {loading ? t("loading") : t("sign_in")}
              </button>
            </form>

            {/* Quick Demo Login Preset Buttons */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 mb-2.5 text-slate-500 text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t("quick_demo_login")}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("superadmin", "admin123")}
                  className="p-2.5 text-left rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 group-hover:text-purple-950">
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    <span>Super Admin</span>
                  </div>
                  <span className="text-[10px] text-purple-700 block mt-0.5">
                    All Mandals Registry
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("mandaladmin", "mandal123")}
                  className="p-2.5 text-left rounded-xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900 group-hover:text-orange-950">
                    <Building2 className="w-3.5 h-3.5 text-orange-600" />
                    <span>Mandal Admin</span>
                  </div>
                  <span className="text-[10px] text-orange-700 block mt-0.5">
                    Full Mandal Portal
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("treasurer", "treasurer123")}
                  className="p-2.5 text-left rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 group-hover:text-blue-950">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Treasurer (Sub-User)</span>
                  </div>
                  <span className="text-[10px] text-blue-700 block mt-0.5">
                    Finance & Reports
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("volunteer", "volunteer123")}
                  className="p-2.5 text-left rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 group-hover:text-emerald-950">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Volunteer (Sub-User)</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">
                    Vargani Collection
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500">
        <p>
          Cloudflare D1 & Pages Optimized • English & मराठी Bilingual
        </p>
      </footer>
    </div>
  );
}
