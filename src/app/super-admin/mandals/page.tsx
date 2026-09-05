"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { MandalFormModal } from "@/components/mandals/MandalFormModal";
import { exportToCSV } from "@/lib/export";
import { Mandal } from "@/db/schema";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Plus,
  Download,
  Search,
  Filter,
} from "lucide-react";

interface MandalWithAdmin extends Mandal {
  admin_username?: string;
  admin_name?: string;
}

export default function SuperAdminMandalsPage() {
  const { t, language } = useTranslation();

  const [mandals, setMandals] = useState<MandalWithAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">(
    "all"
  );

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
      // ignore
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Mandal ID",
      "Mandal Name (English)",
      "Mandal Name (Marathi)",
      "City",
      "Registration Number",
      "Established Year",
      "Contact Phone",
      "Admin Username",
      "Status",
    ];

    const rows = mandals.map((m) => [
      m.id,
      m.name,
      m.name_mr,
      m.city,
      m.registration_no || "",
      m.established_year || "",
      m.contact_phone || "",
      m.admin_username || "",
      m.status,
    ]);

    exportToCSV("All_Ganpati_Mandals_Registry", headers, rows);
  };

  const filtered = mandals.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.name_mr.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      (m.registration_no && m.registration_no.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "all" ? true : m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            <span>{t("nav_mandals")}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full directory of registered festival committees across cities
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t("export_csv")}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("register_mandal")}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t("search")} (Name, City, Registration No)...`}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-hidden bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("all")} ({mandals.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === "active"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              {t("active")} ({mandals.filter((m) => m.status === "active").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("blocked")}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === "blocked"
                  ? "bg-white text-red-700 shadow-xs"
                  : "text-slate-600 hover:text-red-700"
              }`}
            >
              {t("blocked")} ({mandals.filter((m) => m.status === "blocked").length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-bold">{t("mandal_name")}</th>
                <th className="px-4 py-3.5 font-bold">{t("city")}</th>
                <th className="px-4 py-3.5 font-bold">{t("registration_no")}</th>
                <th className="px-4 py-3.5 font-bold">Phone / Est</th>
                <th className="px-4 py-3.5 font-bold">Admin Credentials</th>
                <th className="px-4 py-3.5 font-bold">{t("status")}</th>
                <th className="px-5 py-3.5 font-bold text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    {t("loading")}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No Mandals match your filter
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
                      {mandal.address && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                          {mandal.address}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-semibold">
                      {mandal.city}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                      {mandal.registration_no || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                      <div>{mandal.contact_phone || "—"}</div>
                      {mandal.established_year && (
                        <span className="text-[10px] text-slate-400">
                          Est. {mandal.established_year}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-purple-700 font-bold text-[11px]">
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
                        {mandal.status === "active" ? "Block Access" : "Activate"}
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
