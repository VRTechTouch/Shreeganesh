"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { exportToCSV } from "@/lib/export";
import { Expense, Mandal } from "@/db/schema";
import {
  ReceiptText,
  Plus,
  Download,
  Search,
  Filter,
  Layers,
} from "lucide-react";

export default function ExpensesTrackingPage() {
  const { t, language } = useTranslation();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mandal, setMandal] = useState<Mandal | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [authRes, expRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/expenses"),
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        setMandal(authData.mandal);
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

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const filtered = expenses.filter((exp) => {
    const q = search.toLowerCase();
    const matchesSearch =
      exp.item_title.toLowerCase().includes(q) ||
      (exp.item_title_mr && exp.item_title_mr.toLowerCase().includes(q)) ||
      exp.paid_to.toLowerCase().includes(q) ||
      exp.voucher_no.toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === "all" ? true : exp.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = () => {
    const headers = [
      "Voucher No",
      "Category",
      "Item Title (English)",
      "Item Title (Marathi)",
      "Amount (INR)",
      "Date",
      "Paid To (Vendor)",
      "Payment Mode",
      "Recorded By",
      "Notes",
    ];

    const rows = filtered.map((e) => [
      e.voucher_no,
      e.category,
      e.item_title,
      e.item_title_mr || "",
      e.amount,
      e.expense_date,
      e.paid_to,
      e.payment_mode,
      e.recorded_by_name || "",
      e.notes || "",
    ]);

    exportToCSV("Festival_Expenses_Ledger", headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-red-600" />
            <span>{t("expenses_title")}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("expenses_subtitle")}
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
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("add_expense")}</span>
          </button>
        </div>
      </div>

      {/* Total Banner */}
      <div className="p-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-red-100 uppercase tracking-wider">
            {t("total_expenses")}
          </span>
          <div className="text-2xl font-black font-mono mt-0.5">
            ₹{totalExpenses.toLocaleString()}
          </div>
        </div>
        <div className="text-xs font-medium bg-black/20 px-3 py-1.5 rounded-lg">
          {expenses.length} Total Vouchers Recorded
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`${t("search")} (Item, Vendor, Voucher)...`}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-hidden bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-hidden bg-white font-medium"
          >
            <option value="all">{t("all")} Categories</option>
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
      </div>

      {/* Main Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-bold">{t("voucher_no")}</th>
                <th className="px-4 py-3.5 font-bold">{t("category")}</th>
                <th className="px-4 py-3.5 font-bold">{t("item_title")}</th>
                <th className="px-4 py-3.5 font-bold text-right">{t("amount")}</th>
                <th className="px-4 py-3.5 font-bold">{t("paid_to")}</th>
                <th className="px-4 py-3.5 font-bold">{t("payment_mode")}</th>
                <th className="px-4 py-3.5 font-bold">{t("expense_date")}</th>
                <th className="px-5 py-3.5 font-bold">{t("recorded_by")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    {t("loading")}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    No Expenses recorded
                  </td>
                </tr>
              ) : (
                paginated.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-700">
                      {exp.voucher_no}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 capitalize">
                        {exp.category.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">
                        {exp.item_title}
                      </div>
                      {exp.item_title_mr && (
                        <div className="text-[11px] text-slate-500">
                          {exp.item_title_mr}
                        </div>
                      )}
                      {exp.notes && (
                        <div className="text-[10px] text-slate-400 italic mt-0.5">
                          {exp.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-red-600 text-sm">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {exp.paid_to}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                        {exp.payment_mode.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                      {exp.expense_date}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-[11px]">
                      {exp.recorded_by_name || "Admin"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1} -{" "}
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-2 font-semibold text-slate-800">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={(newExp) => {
          setExpenses((prev) => [newExp, ...prev]);
        }}
        mandalId={mandal?.id || ""}
      />
    </div>
  );
}
