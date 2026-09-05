"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { SubUserFormModal } from "@/components/subusers/SubUserFormModal";
import { User, Mandal } from "@/db/schema";
import {
  UserCheck,
  Plus,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function SubUsersRBACPage() {
  const { t, language } = useTranslation();

  const [users, setUsers] = useState<User[]>([]);
  const [mandal, setMandal] = useState<Mandal | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [authRes, userRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/sub-users"),
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        setMandal(authData.mandal);
      }
      if (userRes.ok) {
        const userData = await userRes.json();
        setUsers(userData.users || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderPermissionBadge = (perm: string) => {
    let label = perm;
    if (perm === "finance.view") label = language === "mr" ? "हिशोब पहा" : "Finance View";
    if (perm === "finance.create") label = language === "mr" ? "वर्गणी/खर्च नोंद" : "Finance Entry";
    if (perm === "members.view") label = language === "mr" ? "सदस्य सूची" : "Members View";
    if (perm === "members.manage") label = language === "mr" ? "सदस्य व्यवस्थापन" : "Members Edit";
    if (perm === "reports.export") label = language === "mr" ? "अहवाल डाउनलोड" : "Export Reports";
    if (perm === "all") label = language === "mr" ? "सर्व अधिकार" : "Full Access";

    return (
      <span
        key={perm}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
      >
        <Shield className="w-3 h-3 text-emerald-600" />
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            <span>{t("subusers_title")}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("subusers_subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t("create_subuser")}</span>
        </button>
      </div>

      {/* RBAC Explanatory Alert */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            {language === "mr"
              ? "भूमिका-आधारित प्रवेश नियंत्रण (Role-Based Access Control)"
              : "Role-Based Access Control (RBAC)"}
          </p>
          <p className="text-emerald-800 leading-relaxed text-[11px]">
            {language === "mr"
              ? "येथे तुम्ही खजिनदार किंवा स्वयंसेवकांसाठी स्वतंत्र लॉगिन तयार करू शकता. उदाहरणार्थ, एखाद्या वापरकर्त्याला केवळ 'वर्गणी नोंद' करण्याचा अधिकार दिल्यास, त्याला मंडळाचे इतर गोपनीय खर्च किंवा अहवाल दिसणार नाहीत."
              : "Sub-users only have access to modules explicitly granted to them. A volunteer assigned only 'Finance Entry' can issue Vargani receipts on their mobile phone, without seeing other administrative tabs."}
          </p>
        </div>
      </div>

      {/* Sub-Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-bold">User</th>
                <th className="px-4 py-3.5 font-bold">Username</th>
                <th className="px-4 py-3.5 font-bold">Role</th>
                <th className="px-4 py-3.5 font-bold">{t("assigned_permissions")}</th>
                <th className="px-4 py-3.5 font-bold">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    {t("loading")}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No sub-users created yet
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  let perms: string[] = [];
                  try {
                    perms = JSON.parse(u.permissions);
                  } catch {
                    perms = [];
                  }

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900 text-sm">
                        {u.name}
                        {u.email && (
                          <div className="text-[10px] text-slate-400 font-sans">
                            {u.email}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-emerald-700 font-bold text-xs flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-emerald-500" />
                          <span>@{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="capitalize font-semibold text-slate-700">
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {perms.length > 0 ? (
                            perms.map((p) => renderPermissionBadge(p))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              No permissions
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            {t("active")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                            <XCircle className="w-3 h-3" />
                            {t("blocked")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <SubUserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={(newUser) => {
          setUsers((prev) => [newUser, ...prev]);
        }}
        mandalId={mandal?.id || ""}
      />
    </div>
  );
}
