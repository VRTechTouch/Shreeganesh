"use client";

import React, { useState } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { X, IndianRupee } from "lucide-react";
import { Donation } from "@/db/schema";

interface VarganiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDonation: Donation) => void;
  mandalId: string;
}

export function VarganiFormModal({
  isOpen,
  onClose,
  onSuccess,
  mandalId,
}: VarganiFormModalProps) {
  const { t } = useTranslation();

  const [donorName, setDonorName] = useState("");
  const [donorNameMr, setDonorNameMr] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [amountPledged, setAmountPledged] = useState<number | "">("");
  const [amountPaid, setAmountPaid] = useState<number | "">("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const numPledged = typeof amountPledged === "number" ? amountPledged : 0;
  const numPaid = typeof amountPaid === "number" ? amountPaid : 0;
  const pending = Math.max(0, numPledged - numPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) {
      setError("Please enter donor name / देणगीदाराचे नाव टाका");
      return;
    }
    if (numPledged <= 0) {
      setError("Please enter valid pledged amount / कृपया योग्य रक्कम टाका");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vargani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandal_id: mandalId,
          donor_name: donorName,
          donor_name_mr: donorNameMr || undefined,
          contact_number: contactNumber || undefined,
          address: address || undefined,
          amount_pledged: numPledged,
          amount_paid: numPaid,
          balance_pending: pending,
          payment_mode: paymentMode,
          payment_date: paymentDate,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record donation");
      }

      onSuccess(data.donation);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5" />
            <h3 className="font-bold text-base">{t("add_donation")}</h3>
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
                {t("donor_name")} *
              </label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="e.g. Ramesh Kulkarni"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("donor_name_mr")}
              </label>
              <input
                type="text"
                value={donorNameMr}
                onChange={(e) => setDonorNameMr(e.target.value)}
                placeholder="उदा. रमेश कुलकर्णी"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("contact_number")}
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+91 98..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("address")}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat / Room No, Area"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-hidden"
              />
            </div>
          </div>

          {/* Amount Controls */}
          <div className="grid grid-cols-3 gap-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("amount_pledged")} *
              </label>
              <input
                type="number"
                min="1"
                required
                value={amountPledged}
                onChange={(e) => {
                  const val = e.target.value === "" ? "" : Number(e.target.value);
                  setAmountPledged(val);
                  if (amountPaid === "") setAmountPaid(val); // By default assume paid in full unless edited
                }}
                className="w-full px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden bg-white"
                placeholder="5000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                {t("amount_paid")} *
              </label>
              <input
                type="number"
                min="0"
                required
                value={amountPaid}
                onChange={(e) =>
                  setAmountPaid(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full px-3 py-1.5 text-sm font-bold border border-emerald-300 text-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
                placeholder="5000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                {t("balance_pending")}
              </label>
              <div className="px-3 py-1.5 text-sm font-bold bg-slate-100 border border-slate-200 rounded-lg text-slate-700">
                ₹{pending.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("payment_mode")}
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden bg-white"
              >
                <option value="cash">{t("mode_cash")}</option>
                <option value="upi">{t("mode_upi")}</option>
                <option value="cheque">{t("mode_cheque")}</option>
                <option value="bank_transfer">{t("mode_bank_transfer")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("date")}
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("notes")}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Aarti Sponsor / Modak Prasad"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden"
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
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? t("loading") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
