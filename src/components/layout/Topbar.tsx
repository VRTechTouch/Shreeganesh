"use client";

import React from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu, LogOut, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopbarProps {
  onToggleSidebar?: () => void;
  userName?: string;
  userRole?: string;
  mandalName?: string;
  mandalNameMr?: string;
}

export function Topbar({
  onToggleSidebar,
  userName = "Sachin Kulkarni",
  userRole = "mandal_admin",
  mandalName = "Shivaji Chowk Sarvajanik Ganeshotsav Mandal",
  mandalNameMr = "शिवाजी चौक सार्वजनिक गणेशोत्सव मंडळ",
}: TopbarProps) {
  const { t, language } = useTranslation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue anyway
    }
    router.push("/login");
  };

  const getRoleBadge = () => {
    if (userRole === "super_admin") {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          {t("role_super_admin")}
        </span>
      );
    }
    if (userRole === "mandal_admin") {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          {t("role_mandal_admin")}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
        <User className="w-3 h-3" />
        {t("role_sub_user")}
      </span>
    );
  };

  const displayMandalName =
    language === "mr" && mandalNameMr ? mandalNameMr : mandalName;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Mandal Name */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight leading-tight line-clamp-1">
            {displayMandalName}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            {getRoleBadge()}
          </div>
        </div>
      </div>

      {/* Right: Language Switcher, User, Logout */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher />

        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-semibold text-slate-800">{userName}</span>
          <span className="text-[10px] text-slate-500 capitalize">{userRole.replace("_", " ")}</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title={t("logout")}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{t("logout")}</span>
        </button>
      </div>
    </header>
  );
}
