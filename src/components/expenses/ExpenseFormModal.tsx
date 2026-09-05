"use client";

import React, { useState } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { X, ReceiptText } from "lucide-react";
import { Expense } from "@/db/schema";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newExpense: Expense) => void;
  mandalId: string;
}

export function ExpenseFormModal({
  isOpen,
  onClose,
  onSuccess,
  mandalId,
}: ExpenseFormModalProps) {
  const { t } = useTranslation();

  const [category, setCategory] = useState<
    | "mandap_stage"
    | "decoration_lighting"
    | "sound_dhol"
    | "prasad_bhojan"
    | "puja_samagri"
    | "police_security"
    | "cultural_events"
    | "miscellaneous"
  >("mandap_stage");

  const [itemTitle, setItemTitle] = useState("");
  const [itemTitleMr, setItemTitleMr] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paidTo, setPaidTo] = useState("");
  const [paymentMode, setPaymentMode] = useState<
    "cash" | "upi" | "cheque" | "bank_transfer"
  >("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) {
      setError("Please enter expense title / खर्चाचा तपशील टाका");
      return;
    }
    const numAmount = typeof amount === "number" ? amount : 0;
    if (numAmount <= 0) {
      setError("Please enter valid expense amount / कृपया योग्य रक्कम टाका");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandal_id: mandalId,
          category,
          item_title: itemTitle,
          item_title_mr: itemTitleMr || undefined,
          amount: numAmount,
          expense_date: expenseDate,
          paid_to: paidTo,
          payment_mode: paymentMode,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save expense");
      }

      onSuccess(data.expense);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error recording expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5" />
            <h3 className="font-bold text-base">{t("add_expense")}</h3>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("category")} *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden bg-white"
            >
              <option value="mandap_stage">{t("cat_mandap_stage")}</option>
              <option value="decoration_lighting">{t("cat_decoration_lighting")}</option>
              <option value="sound_dhol">{t("cat_sound_dhol")}</option>
              <option value="prasad_bhojan">{t("cat_prasad_bhojan")}</option>
              <option value="puja_samagri">{t("cat_puja_samagri")}</option>
              <option value="police_security">{t("cat_police_security")}</option>
              <option value="cultural_events">{t("cat_cultural_events")}</option>
              <option value="miscellaneous">{t("cat_miscellaneous")}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("item_title")} *
              </label>
              <input
                type="text"
                required
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="e.g. Mandap Setup Advance"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("item_title_mr")}
              </label>
              <input
                type="text"
                value={itemTitleMr}
                onChange={(e) => setItemTitleMr(e.target.value)}
                placeholder="उदा. मंडप उभारणी आगाऊ रक्कम"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("amount")} *
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="15000"
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("expense_date")} *
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("paid_to")} *
              </label>
              <input
                type="text"
                required
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="e.g. Ramesh Decorators / Shop"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("payment_mode")}
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden bg-white"
              >
                <option value="cash">{t("mode_cash")}</option>
                <option value="upi">{t("mode_upi")}</option>
                <option value="cheque">{t("mode_cheque")}</option>
                <option value="bank_transfer">{t("mode_bank_transfer")}</option>
              </select>
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
              placeholder="Bill reference number or details"
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
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? t("loading") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
