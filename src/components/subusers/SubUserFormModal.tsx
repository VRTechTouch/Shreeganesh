"use client";

import React, { useState } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { AVAILABLE_PERMISSIONS, Permission } from "@/lib/permissions";
import { X, UserCheck, Shield } from "lucide-react";
import { User } from "@/db/schema";

interface SubUserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUser: User) => void;
  mandalId: string;
}

export function SubUserFormModal({
  isOpen,
  onClose,
  onSuccess,
  mandalId,
}: SubUserFormModalProps) {
  const { t, language } = useTranslation();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([
    "finance.view",
    "finance.create",
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const togglePermission = (perm: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sub-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandal_id: mandalId,
          name,
          username,
          password,
          email: email || undefined,
          permissions: selectedPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create sub-user");
      }

      onSuccess(data.user);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating sub-user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            <h3 className="font-bold text-base">{t("create_subuser")}</h3>
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
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("username")} *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                placeholder="e.g. sunil_treasurer"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("password")} *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Initial password"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Granular RBAC Permissions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-bold text-slate-800">
                {t("assigned_permissions")} (RBAC)
              </label>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
              {AVAILABLE_PERMISSIONS.map((perm) => {
                const isChecked = selectedPermissions.includes(perm.id);
                return (
                  <label
                    key={perm.id}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePermission(perm.id)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-800 block">
                        {language === "mr" ? perm.labelMr : perm.labelEn}
                      </span>
                      <span className="text-slate-500 text-[11px] block">
                        {language === "mr"
                          ? perm.descriptionMr
                          : perm.descriptionEn}
                      </span>
                    </div>
                  </label>
                );
              })}
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
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? t("loading") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
