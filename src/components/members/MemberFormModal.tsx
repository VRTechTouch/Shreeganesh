"use client";

import React, { useState } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { X, Users } from "lucide-react";
import { Member } from "@/db/schema";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMember: Member) => void;
  mandalId: string;
}

export function MemberFormModal({
  isOpen,
  onClose,
  onSuccess,
  mandalId,
}: MemberFormModalProps) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [nameMr, setNameMr] = useState("");
  const [position, setPosition] = useState<
    | "president"
    | "vice_president"
    | "secretary"
    | "joint_secretary"
    | "treasurer"
    | "committee_member"
    | "volunteer"
  >("committee_member");
  const [contactNumber, setContactNumber] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [joiningYear, setJoiningYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter member name / सदस्याचे नाव टाका");
      return;
    }
    if (!contactNumber.trim()) {
      setError("Please enter contact number / मोबाईल नंबर टाका");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandal_id: mandalId,
          name,
          name_mr: nameMr || undefined,
          position,
          contact_number: contactNumber,
          blood_group: bloodGroup || undefined,
          address: address || undefined,
          joining_year: joiningYear,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add member");
      }

      onSuccess(data.member);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-base">{t("add_member")}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("member_name")} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sunil Shinde"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("member_name_mr")}
              </label>
              <input
                type="text"
                value={nameMr}
                onChange={(e) => setNameMr(e.target.value)}
                placeholder="उदा. सुनील शिंदे"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("position")} *
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-white"
              >
                <option value="president">{t("pos_president")}</option>
                <option value="vice_president">{t("pos_vice_president")}</option>
                <option value="secretary">{t("pos_secretary")}</option>
                <option value="joint_secretary">{t("pos_joint_secretary")}</option>
                <option value="treasurer">{t("pos_treasurer")}</option>
                <option value="committee_member">{t("pos_committee_member")}</option>
                <option value="volunteer">{t("pos_volunteer")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("contact_number")} *
              </label>
              <input
                type="tel"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+91 98221..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("blood_group")}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-white"
              >
                <option value="">Select (ऐच्छिक)</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("joining_year")}
              </label>
              <input
                type="number"
                value={joiningYear}
                onChange={(e) => setJoiningYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("address")}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Residential address"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? t("loading") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
