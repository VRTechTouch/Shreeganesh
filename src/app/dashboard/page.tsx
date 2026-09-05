"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { ReceiptModal } from "@/components/vargani/ReceiptModal";
import { VarganiFormModal } from "@/components/vargani/VarganiFormModal";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { Donation, Expense, Mandal } from "@/db/schema";
import {
  IndianRupee,
  ReceiptText,
  TrendingUp,
  Wallet,
  Clock,
  Plus,
  ArrowUpRight,
  Eye,
  CheckCircle2,
} from "lucide-react";

export default function MandalDashboardPage() {
  const { t, language } = useTranslation();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mandal, setMandal] = useState<Mandal | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isVarganiOpen, setIsVarganiOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const fetchData = async () => {
    try {
      const [authRes, donRes, expRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/vargani"),
        fetch("/api/expenses"),
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        setMandal(authData.mandal);
      }
      if (donRes.ok) {
        const donData = await donRes.json();
        setDonations(donData.donations || []);
      }
      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData.expenses || []);
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

  // Compute Metrics
  const totalPledged = donations.reduce(
    (acc, curr) => acc + (curr.amount_pledged || 0),
    0
  );
  const totalCollected = donations.reduce(
    (acc, curr) => acc + (curr.amount_paid || 0),
    0
  );
  const totalPending = donations.reduce(
    (acc, curr) => acc + (curr.balance_pending || 0),
    0
  );
  const totalExpenses = expenses.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0
  );
  const netBalance = totalCollected - totalExpenses;
  const progressPercent =
    totalPledged > 0 ? Math.min(100, Math.round((totalCollected / totalPledged) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
            {t("ganesh_invocation")}
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {language === "mr" && mandal?.name_mr
              ? mandal.name_mr
              : mandal?.name || "Ganeshotsav Committee"}
          </h1>
          <p className="text-xs text-orange-100 mt-1 max-w-xl">
            {language === "mr"
              ? "दैनिक वर्गणी जमा, खर्च हिशोब आणि देणगीदारांच्या पावत्यांचे केंद्रीय मुख्यपृष्ठ"
              : "Live festival treasury balance, Vargani collections, and expenditure dashboard"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsVarganiOpen(true)}
            className="px-4 py-2.5 bg-white text-orange-700 hover:bg-orange-50 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("add_donation")}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpenseOpen(true)}
            className="px-4 py-2.5 bg-orange-950/40 hover:bg-orange-950/60 text-white border border-white/30 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("add_expense")}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {t("total_collected")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 font-mono">
              ₹{totalCollected.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {donations.length} {language === "mr" ? "पावत्या फाडल्या" : "donations recorded"}
            </span>
          </div>
        </div>

        {/* Total Pending */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {t("total_pending")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 font-mono">
              ₹{totalPending.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {language === "mr" ? "कबूल केलेली येणे बाकी" : "Pledged balance pending"}
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {t("total_expenses")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ReceiptText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-red-600 font-mono">
              ₹{totalExpenses.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {expenses.length} {language === "mr" ? "व्हाउचर्स नोंदवले" : "vouchers logged"}
            </span>
          </div>
        </div>

        {/* Net Treasury Balance */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">
              {t("net_balance")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center border border-slate-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400 font-mono">
              ₹{netBalance.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-300 mt-0.5 block">
              {language === "mr" ? "तिजोरीतील रोकड शिल्लक" : "Current cash in treasury"}
            </span>
          </div>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="font-bold text-slate-800">
              {t("collection_progress")}: {progressPercent}%
            </span>
          </div>
          <span className="font-mono font-semibold text-slate-600">
            ₹{totalCollected.toLocaleString()} / ₹{totalPledged.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Two Column Section: Recent Donations & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donations */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                {t("recent_donations")}
              </h3>
              <p className="text-[11px] text-slate-500">
                Latest Vargani contributions & instant receipts
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsVarganiOpen(true)}
              className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 border border-orange-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("add_donation")}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {donations.slice(0, 5).map((don) => (
              <div
                key={don.id}
                className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 rounded-lg px-2 transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {language === "mr" && don.donor_name_mr
                      ? don.donor_name_mr
                      : don.donor_name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono font-semibold text-orange-700">
                      {don.receipt_no}
                    </span>
                    <span>•</span>
                    <span>{don.payment_date}</span>
                    <span>•</span>
                    <span className="capitalize">{don.payment_mode}</span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="font-bold text-emerald-600 font-mono text-sm">
                      ₹{don.amount_paid.toLocaleString()}
                    </div>
                    {don.balance_pending > 0 && (
                      <div className="text-[10px] text-amber-600 font-semibold font-mono">
                        शिल्लक: ₹{don.balance_pending.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDonation(don)}
                    title={t("view_receipt")}
                    className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                {t("recent_expenses")}
              </h3>
              <p className="text-[11px] text-slate-500">
                Expenditures across pandal, decoration & prasad
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsExpenseOpen(true)}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("add_expense")}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {expenses.slice(0, 5).map((exp) => (
              <div
                key={exp.id}
                className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 rounded-lg px-2 transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {language === "mr" && exp.item_title_mr
                      ? exp.item_title_mr
                      : exp.item_title}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono text-slate-500">{exp.voucher_no}</span>
                    <span>•</span>
                    <span className="text-slate-600">{exp.paid_to}</span>
                    <span>•</span>
                    <span>{exp.expense_date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-red-600 font-mono text-sm">
                    -₹{exp.amount.toLocaleString()}
                  </div>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize mt-0.5">
                    {exp.category.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <VarganiFormModal
        isOpen={isVarganiOpen}
        onClose={() => setIsVarganiOpen(false)}
        onSuccess={(newDon) => {
          setDonations((prev) => [newDon, ...prev]);
          setSelectedDonation(newDon); // Immediately show receipt!
        }}
        mandalId={mandal?.id || ""}
      />

      <ExpenseFormModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        onSuccess={(newExp) => {
          setExpenses((prev) => [newExp, ...prev]);
        }}
        mandalId={mandal?.id || ""}
      />

      <ReceiptModal
        donation={selectedDonation}
        mandal={mandal}
        isOpen={!!selectedDonation}
        onClose={() => setSelectedDonation(null)}
      />
    </div>
  );
}
