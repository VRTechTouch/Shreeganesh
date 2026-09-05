"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { exportToCSV } from "@/lib/export";
import { Donation, Expense, Mandal } from "@/db/schema";
import {
  FileSpreadsheet,
  Download,
  IndianRupee,
  ReceiptText,
  Wallet,
  Clock,
  PieChart,
} from "lucide-react";

export default function FinancialReportsPage() {
  const { t, language } = useTranslation();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mandal, setMandal] = useState<Mandal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/vargani"),
      fetch("/api/expenses"),
    ])
      .then(async ([authRes, donRes, expRes]) => {
        if (authRes.ok) {
          const a = await authRes.json();
          setMandal(a.mandal);
        }
        if (donRes.ok) {
          const d = await donRes.json();
          setDonations(d.donations || []);
        }
        if (expRes.ok) {
          const e = await expRes.json();
          setExpenses(e.expenses || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPledged = donations.reduce((acc, c) => acc + c.amount_pledged, 0);
  const totalCollected = donations.reduce((acc, c) => acc + c.amount_paid, 0);
  const totalPending = donations.reduce((acc, c) => acc + c.balance_pending, 0);
  const totalExpenses = expenses.reduce((acc, c) => acc + c.amount, 0);
  const netBalance = totalCollected - totalExpenses;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const handleExportFullAudit = () => {
    const headers = [
      "Record Type",
      "Reference / Voucher",
      "Entity / Title",
      "Category / Mode",
      "Date",
      "Amount Paid / In (INR)",
      "Amount Out / Exp (INR)",
      "Balance Pending (INR)",
    ];

    const rows: (string | number)[][] = [];

    // Donations
    donations.forEach((d) => {
      rows.push([
        "Vargani Donation",
        d.receipt_no,
        d.donor_name,
        d.payment_mode,
        d.payment_date,
        d.amount_paid,
        0,
        d.balance_pending,
      ]);
    });

    // Expenses
    expenses.forEach((e) => {
      rows.push([
        "Expense",
        e.voucher_no,
        e.item_title,
        e.category,
        e.expense_date,
        0,
        e.amount,
        0,
      ]);
    });

    exportToCSV("Complete_Financial_Audit_Report", headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-600" />
            <span>{t("nav_reports")}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete financial audit statements and income vs. expenditure reconciliation
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportFullAudit}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{language === "mr" ? "संपूर्ण ऑडिट अहवाल डाउनलोड" : "Download Complete Audit CSV"}</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">
            {t("total_pledged")}
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            ₹{totalPledged.toLocaleString()}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase">
            {t("total_collected")} (जमा)
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-2">
            ₹{totalCollected.toLocaleString()}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-amber-700 uppercase">
            {t("total_pending")} (शिल्लक)
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-2">
            ₹{totalPending.toLocaleString()}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-red-700 uppercase">
            {t("total_expenses")} (खर्च)
          </span>
          <div className="text-2xl font-black text-red-600 font-mono mt-2">
            ₹{totalExpenses.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Net Treasury Balance Strip */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t("net_balance")}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              ₹{netBalance.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 space-y-0.5">
          <div>
            {language === "mr" ? "एकूण जमा" : "Total Receipts"}:{" "}
            <strong className="text-white">₹{totalCollected.toLocaleString()}</strong>
          </div>
          <div>
            {language === "mr" ? "एकूण खर्च" : "Total Disbursements"}:{" "}
            <strong className="text-white">₹{totalExpenses.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Category Wise Expenditure Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-800 text-base">
            {language === "mr"
              ? "खर्च वर्गवारीनुसार वर्गीकरण (Expenditure Breakdown)"
              : "Expenditure by Category"}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-bold">{t("category")}</th>
                <th className="px-4 py-3.5 font-bold text-right">
                  {language === "mr" ? "व्हाउचर संख्या" : "Voucher Count"}
                </th>
                <th className="px-5 py-3.5 font-bold text-right">{t("amount")}</th>
                <th className="px-5 py-3.5 font-bold text-right">% of Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(categoryTotals).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    No expense records to analyze
                  </td>
                </tr>
              ) : (
                Object.entries(categoryTotals).map(([cat, amt]) => {
                  const count = expenses.filter((e) => e.category === cat).length;
                  const pct = totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : "0";
                  const key = `cat_${cat}` as any;
                  const label = t(key) || cat.replace("_", " ");

                  return (
                    <tr key={cat} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-800">
                        {label}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                        {count}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-red-600 text-sm">
                        ₹{amt.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-700">
                        {pct}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
