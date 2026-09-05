"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/i18n/I18nContext";
import {
  LayoutDashboard,
  IndianRupee,
  ReceiptText,
  Users,
  UserCheck,
  FileSpreadsheet,
  Building2,
  X,
} from "lucide-react";

interface SidebarProps {
  userRole?: string;
  userPermissions?: string[];
  isOpen?: boolean;
  onClose?: () => void;
  mandalName?: string;
}

export function Sidebar({
  userRole = "mandal_admin",
  userPermissions = [],
  isOpen = false,
  onClose,
  mandalName,
}: SidebarProps) {
  const pathname = usePathname();
  const { t, language } = useTranslation();

  const isSuperAdmin = userRole === "super_admin";
  const isMandalAdmin = userRole === "mandal_admin";

  // Check sub-user granular permissions
  const canViewFinance =
    isSuperAdmin ||
    isMandalAdmin ||
    userPermissions.includes("finance.view") ||
    userPermissions.includes("finance.create") ||
    userPermissions.includes("all");

  const canViewMembers =
    isSuperAdmin ||
    isMandalAdmin ||
    userPermissions.includes("members.view") ||
    userPermissions.includes("members.manage") ||
    userPermissions.includes("all");

  const canViewSubUsers =
    isSuperAdmin ||
    isMandalAdmin ||
    userPermissions.includes("subusers.manage");

  const canViewReports =
    isSuperAdmin ||
    isMandalAdmin ||
    userPermissions.includes("reports.export") ||
    userPermissions.includes("all");

  const links = isSuperAdmin
    ? [
        {
          href: "/super-admin",
          label: t("nav_dashboard"),
          icon: LayoutDashboard,
        },
        {
          href: "/super-admin/mandals",
          label: t("nav_mandals"),
          icon: Building2,
        },
      ]
    : [
        {
          href: "/dashboard",
          label: t("nav_dashboard"),
          icon: LayoutDashboard,
          visible: true,
        },
        {
          href: "/dashboard/vargani",
          label: t("nav_vargani"),
          icon: IndianRupee,
          visible: canViewFinance,
        },
        {
          href: "/dashboard/expenses",
          label: t("nav_expenses"),
          icon: ReceiptText,
          visible: canViewFinance,
        },
        {
          href: "/dashboard/members",
          label: t("nav_members"),
          icon: Users,
          visible: canViewMembers,
        },
        {
          href: "/dashboard/sub-users",
          label: t("nav_subusers"),
          icon: UserCheck,
          visible: canViewSubUsers,
        },
        {
          href: "/dashboard/reports",
          label: t("nav_reports"),
          icon: FileSpreadsheet,
          visible: canViewReports,
        },
      ].filter((item) => item.visible);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-68 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header / Brand */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-md text-lg">
              ॐ
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-orange-400">
                {t("app_name")}
              </h1>
              <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {mandalName || (language === "mr" ? "गणेशोत्सव समिती" : "Festival Portal")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Traditional Invocation Banner */}
        <div className="px-4 py-2 bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-orange-950/40 border-b border-orange-900/30 text-center">
          <span className="text-[11px] font-medium text-orange-300 tracking-wider">
            {t("ganesh_invocation")}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-slate-400"
                  }`}
                />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Cloudflare D1 Ready</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
            Active
          </span>
        </div>
      </aside>
    </>
  );
}
