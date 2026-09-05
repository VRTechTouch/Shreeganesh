"use client";

import React, { useState } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { X, Building2 } from "lucide-react";
import { Mandal } from "@/db/schema";

interface MandalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMandal: Mandal) => void;
}

export function MandalFormModal({
  isOpen,
  onClose,
  onSuccess,
}: MandalFormModalProps) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [nameMr, setNameMr] = useState("");
  const [city, setCity] = useState("Pune");
  const [registrationNo, setRegistrationNo] = useState("");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [establishedYear, setEstablishedYear] = useState<number>(2020);

  // Initial Mandal Admin credentials
  const [adminName, setAdminName] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nameMr.trim()) {
      setError("Please enter both English and Marathi Mandal names");
      return;
    }
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setError("Please generate initial Mandal Admin credentials");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/mandals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          name_mr: nameMr,
          city,
          registration_no: registrationNo || undefined,
          address: address || undefined,
          contact_phone: contactPhone || undefined,
          established_year: establishedYear,
          admin_name: adminName || `${name} Admin`,
          admin_username: adminUsername,
          admin_password: adminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register mandal");
      }

      onSuccess(data.mandal);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error registering mandal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <h3 className="font-bold text-base">{t("register_mandal")}</h3>
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
                {t("mandal_name")} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!adminUsername) {
                    setAdminUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) + "_admin"
                    );
                  }
                }}
                placeholder="e.g. Kasba Ganpati Mandal"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("mandal_name_mr")} *
              </label>
              <input
                type="text"
                required
                value={nameMr}
                onChange={(e) => setNameMr(e.target.value)}
                placeholder="उदा. कसबा गणपती मंडळ"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("city")} *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Pune / Mumbai / Nagpur"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("registration_no")}
              </label>
              <input
                type="text"
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                placeholder="MH/PUN/2020/F-..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("established_year")}
              </label>
              <input
                type="number"
                value={establishedYear}
                onChange={(e) => setEstablishedYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Chowk / Landmark, Area"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          {/* Initial Admin Credentials Section */}
          <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 space-y-3">
            <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
              Initial Mandal Admin Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("admin_username")} *
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin username"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("admin_password")} *
                </label>
                <input
                  type="text"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="initial password"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden bg-white"
                />
              </div>
            </div>
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
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? t("loading") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
