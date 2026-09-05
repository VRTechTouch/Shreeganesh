"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { MandalFormModal } from "@/components/mandals/MandalFormModal";
import { Mandal } from "@/db/schema";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  Shield,
  Search,
} from "lucide-react";
import Link from "next/link";

interface MandalWithAdmin extends Mandal {
  admin_username?: string;
  admin_name?: string;
}

export default function SuperAdminOverviewPage() {
  const { t, language } = useTranslation();

  const [mandals, setMandals] = useState<MandalWithAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchMandals = async () => {
    try {
      const res = await fetch("/api/mandals");
      if (res.ok) {
        const data = await res.json();
        setMandals(data.mandals || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandals();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/mandals/${id}/toggle`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setMandals((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, status: data.mandal.status } : m
          )
        );
      }
    } catch {
      // error toggling
    }
  };

  const totalMandals = mandals.length;
  const activeMandals = mandals.filter((m) => m.status === "active").length;
  const blockedMandals = mandals.filter((m) => m.status === "blocked").length;

  const filtered = mandals.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.name_mr.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>{t("super_admin_title")}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {language === "mr"
              ? "महाराष्ट्र राज्य सर्व गणेशोत्सव मंडळ नियंत्रण कक्ष"
              : "State Festival Committees Command Center"}
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            {t("super_admin_subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t("register_mandal")}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              {t("total_mandals")}
            </span>
            <span className="text-2xl font-black text-slate-900">
              {totalMandals}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              {t("active_mandals")}
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {activeMandals}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              {t("blocked_mandals")}
            </span>
            <span className="text-2xl font-black text-red-600">
              {blockedMandals}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Mandals Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {t("nav_mandals")}
            </h3>
            <p className="text-xs text-slate-500">
              Master tenant directory with real-time active/blocked control
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search")}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden w-48 sm:w-64"
              />
            </div>
            <Link
              href="/super-admin/mandals"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
            >
              <span>{t("all")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-bold">{t("mandal_name")}</th>
                <th className="px-4 py-3 font-bold">{t("city")}</th>
                <th className="px-4 py-3 font-bold">{t("registration_no")}</th>
                <th className="px-4 py-3 font-bold">Admin Account</th>
                <th className="px-4 py-3 font-bold">{t("status")}</th>
                <th className="px-5 py-3 font-bold text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    {t("loading")}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No Mandals found
                  </td>
                </tr>
              ) : (
                filtered.map((mandal) => (
                  <tr key={mandal.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">
                        {language === "mr" ? mandal.name_mr : mandal.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {language === "mr" ? mandal.name : mandal.name_mr}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {mandal.city}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                      {mandal.registration_no || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-purple-700 font-semibold text-[11px]">
                        @{mandal.admin_username}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {mandal.admin_name}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {mandal.status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {t("active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200">
                          <XCircle className="w-3 h-3" />
                          {t("blocked")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(mandal.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          mandal.status === "active"
                            ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {mandal.status === "active" ? "Block Mandal" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      <MandalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newMandal) => {
          setMandals((prev) => [newMandal as MandalWithAdmin, ...prev]);
        }}
      />
    </div>
  );
}
