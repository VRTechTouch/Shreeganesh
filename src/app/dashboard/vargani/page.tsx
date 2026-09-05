"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { VarganiFormModal } from "@/components/vargani/VarganiFormModal";
import { ReceiptModal } from "@/components/vargani/ReceiptModal";
import { exportToCSV } from "@/lib/export";
import { Donation, Mandal } from "@/db/schema";
import {
  IndianRupee,
  Plus,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
} from "lucide-react";

export default function VarganiLedgerPage() {
  const { t, language } = useTranslation();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [mandal, setMandal] = useState<Mandal | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const fetchData = async () => {
    try {
      const [authRes, donRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/vargani"),
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        setMandal(authData.mandal);
      }
      if (donRes.ok) {
        const donData = await donRes.json();
        setDonations(donData.donations || []);
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

  // Summary Metrics
  const totalPledged = donations.reduce((acc, curr) => acc + curr.amount_pledged, 0);
  const totalCollected = donations.reduce((acc, curr) => acc + curr.amount_paid, 0);
  const totalPending = donations.reduce((acc, curr) => acc + curr.balance_pending, 0);

  // Filter and Search Logic
  const filtered = donations.filter((don) => {
    const q = search.toLowerCase();
    const matchesSearch =
      don.donor_name.toLowerCase().includes(q) ||
      (don.donor_name_mr && don.donor_name_mr.toLowerCase().includes(q)) ||
      (don.contact_number && don.contact_number.includes(q)) ||
      don.receipt_no.toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter === "paid") {
      matchesStatus = don.balance_pending === 0;
    } else if (statusFilter === "pending") {
      matchesStatus = don.balance_pending > 0;
    }

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = () => {
    const headers = [
      "Receipt No",
      "Donor Name (English)",
      "Donor Name (Marathi)",
      "Contact Number",
      "Address",
      "Amount Pledged (INR)",
      "Amount Paid (INR)",
      "Balance Pending (INR)",
      "Payment Mode",
      "Date",
      "Received By",
      "Notes",
    ];

    const rows = filtered.map((d) => [
      d.receipt_no,
      d.donor_name,
      d.donor_name_mr || "",
      d.contact_number || "",
      d.address || "",
      d.amount_pledged,
      d.amount_paid,
      d.balance_pending,
      d.payment_mode,
      d.payment_date,
      d.received_by_name || "",
      d.notes || "",
    ]);

    exportToCSV("Vargani_Donations_Ledger", headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-orange-600" />
            <span>{t("vargani_title")}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("vargani_subtitle")}
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
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("add_donation")}</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">
            {t("total_pledged")}
          </span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            ₹{totalPledged.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">
            {t("total_collected")} (जमा)
          </span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">
            ₹{totalCollected.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase">
            {t("total_pending")} (शिल्लक)
          </span>
          <div className="text-xl font-black text-amber-600 font-mono mt-1">
            ₹{totalPending.toLocaleString()}
          </div>
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
            placeholder={`${t("search")} (Name, Receipt, Phone)...`}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-hidden bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("all")} ({donations.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("paid");
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === "paid"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              पूर्ण जमा ({donations.filter((d) => d.balance_pending === 0).length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("pending");
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === "pending"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-slate-600 hover:text-amber-700"
              }`}
            >
              उर्वरित शिल्लक ({donations.filter((d) => d.balance_pending > 0).length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-bold">{t("receipt_no")}</th>
                <th className="px-4 py-3.5 font-bold">{t("donor_name")}</th>
                <th className="px-4 py-3.5 font-bold text-right">{t("amount_pledged")}</th>
                <th className="px-4 py-3.5 font-bold text-right">{t("amount_paid")} (जमा)</th>
                <th className="px-4 py-3.5 font-bold text-right">{t("balance_pending")} (शिल्लक)</th>
                <th className="px-4 py-3.5 font-bold">{t("payment_mode")}</th>
                <th className="px-4 py-3.5 font-bold">{t("date")}</th>
                <th className="px-5 py-3.5 font-bold text-center">{t("actions")}</th>
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
                    No Vargani records found
                  </td>
                </tr>
              ) : (
                paginated.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-orange-700">
                      {don.receipt_no}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">
                        {don.donor_name}
                      </div>
                      {don.donor_name_mr && (
                        <div className="text-[11px] text-slate-500">
                          {don.donor_name_mr}
                        </div>
                      )}
                      {don.contact_number && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {don.contact_number}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-700 font-semibold">
                      ₹{don.amount_pledged.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 text-sm">
                      ₹{don.amount_paid.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-sm">
                      {don.balance_pending > 0 ? (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          ₹{don.balance_pending.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-xs font-semibold">
                          निरंक (0)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                        {don.payment_mode.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                      {don.payment_date}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedDonation(don)}
                        className="px-2.5 py-1 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{t("view_receipt")}</span>
                      </button>
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
      <VarganiFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={(newDon) => {
          setDonations((prev) => [newDon, ...prev]);
          setSelectedDonation(newDon); // Auto trigger receipt for printing
        }}
        mandalId={mandal?.id || ""}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        donation={selectedDonation}
        mandal={mandal}
        isOpen={!!selectedDonation}
        onClose={() => setSelectedDonation(null)}
      />
    </div>
  );
}
