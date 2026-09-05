"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { MemberFormModal } from "@/components/members/MemberFormModal";
import { exportToCSV } from "@/lib/export";
import { Member, Mandal } from "@/db/schema";
import {
  Users,
  Plus,
  Download,
  Search,
  Trash2,
  Phone,
  Droplet,
  Award,
} from "lucide-react";

export default function CommitteeMembersPage() {
  const { t, language } = useTranslation();

  const [members, setMembers] = useState<Member[]>([]);
  const [mandal, setMandal] = useState<Mandal | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [authRes, memRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/members"),
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        setMandal(authData.mandal);
      }
      if (memRes.ok) {
        const memData = await memRes.json();
        setMembers(memData.members || []);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this committee member? / सदस्याला हटवायचे आहे का?")) {
      return;
    }

    try {
      const res = await fetch(`/api/members?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Member ID",
      "Full Name (English)",
      "Full Name (Marathi)",
      "Position",
      "Contact Number",
      "Blood Group",
      "Joining Year",
      "Address",
      "Status",
    ];

    const rows = members.map((m) => [
      m.id,
      m.name,
      m.name_mr || "",
      m.position,
      m.contact_number,
      m.blood_group || "",
      m.joining_year || "",
      m.address || "",
      m.status || "active",
    ]);

    exportToCSV("Committee_Members_Directory", headers, rows);
  };

  const getPositionLabel = (pos: string) => {
    const key = `pos_${pos}` as any;
    return t(key) || pos;
  };

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      (m.name_mr && m.name_mr.toLowerCase().includes(q)) ||
      m.contact_number.includes(q);

    const matchesPos = positionFilter === "all" ? true : m.position === positionFilter;

    return matchesSearch && matchesPos;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>{t("members_title")}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("members_subtitle")}
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
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("add_member")}</span>
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
            placeholder={`${t("search")} (Name, Mobile)...`}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-white font-medium"
          >
            <option value="all">{t("all")} Positions</option>
            <option value="president">{t("pos_president")}</option>
            <option value="vice_president">{t("pos_vice_president")}</option>
            <option value="secretary">{t("pos_secretary")}</option>
            <option value="treasurer">{t("pos_treasurer")}</option>
            <option value="committee_member">{t("pos_committee_member")}</option>
            <option value="volunteer">{t("pos_volunteer")}</option>
          </select>
        </div>
      </div>

      {/* Members Grid / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            {t("loading")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No committee members found
          </div>
        ) : (
          filtered.map((member) => (
            <div
              key={member.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      <Award className="w-3 h-3" />
                      {getPositionLabel(member.position)}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-2">
                      {language === "mr" && member.name_mr
                        ? member.name_mr
                        : member.name}
                    </h3>
                    {member.name_mr && (
                      <p className="text-xs text-slate-500">
                        {language === "mr" ? member.name : member.name_mr}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(member.id)}
                    title={t("delete")}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{member.contact_number}</span>
                  </div>

                  {member.blood_group && (
                    <div className="flex items-center gap-2">
                      <Droplet className="w-3.5 h-3.5 text-red-500" />
                      <span>
                        Blood Group: <strong>{member.blood_group}</strong>
                      </span>
                    </div>
                  )}

                  {member.address && (
                    <div className="text-[11px] text-slate-400 truncate mt-1">
                      {member.address}
                    </div>
                  )}
                </div>
              </div>

              {member.joining_year && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>सामील वर्ष / Est: {member.joining_year}</span>
                  <span className="text-emerald-600 font-semibold">Active</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      <MemberFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={(newMember) => {
          setMembers((prev) => [newMember, ...prev]);
        }}
        mandalId={mandal?.id || ""}
      />
    </div>
  );
}
