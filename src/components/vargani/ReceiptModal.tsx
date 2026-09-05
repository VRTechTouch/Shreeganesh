"use client";

import React from "react";
import { useTranslation } from "@/i18n/I18nContext";
import { Donation, Mandal } from "@/db/schema";
import { Printer, X, CheckCircle2 } from "lucide-react";

interface ReceiptModalProps {
  donation: Donation | null;
  mandal: Mandal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({
  donation,
  mandal,
  isOpen,
  onClose,
}: ReceiptModalProps) {
  const { t, language } = useTranslation();

  if (!isOpen || !donation) return null;

  const handlePrint = () => {
    window.print();
  };

  const mandalName =
    language === "mr" && mandal?.name_mr ? mandal.name_mr : mandal?.name || "श्री गणेश मित्र मंडळ";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-200 my-8">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold">{t("receipt_title")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              {t("print_receipt")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Container */}
        <div
          id="printable-receipt"
          className="p-8 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 text-slate-900 font-serif border-4 border-amber-800/80 m-4 rounded-xl relative shadow-inner"
        >
          {/* Watermark Ganesh Om */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 text-9xl font-bold text-amber-900">
            ॐ
          </div>

          {/* Invocation Header */}
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-0.5 text-sm font-bold tracking-widest text-amber-900 border-b border-amber-800/50">
              {t("ganesh_invocation")}
            </span>
          </div>

          {/* Mandal Details */}
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-2xl font-extrabold text-amber-950 tracking-tight">
              {mandalName}
            </h2>
            {mandal?.address && (
              <p className="text-xs text-slate-600 font-sans">{mandal.address}</p>
            )}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-600 font-sans pt-1">
              {mandal?.registration_no && (
                <span>
                  <strong>नोंदणी क्र. / Reg No:</strong> {mandal.registration_no}
                </span>
              )}
              {mandal?.established_year && (
                <span>
                  <strong>स्थापना / Est:</strong> {mandal.established_year}
                </span>
              )}
            </div>
          </div>

          {/* Receipt Number & Date Strip */}
          <div className="flex items-center justify-between border-y-2 border-amber-900/40 py-2 mb-6 font-sans text-xs sm:text-sm font-semibold bg-amber-100/50 px-3 rounded">
            <div>
              <span className="text-amber-950">{t("receipt_no")}: </span>
              <span className="font-mono text-base font-bold text-orange-800">
                {donation.receipt_no}
              </span>
            </div>
            <div>
              <span className="text-amber-950">{t("date")}: </span>
              <span className="text-slate-800">{donation.payment_date}</span>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="space-y-4 text-sm leading-relaxed font-sans">
            <p className="text-slate-700 italic">
              {t("receipt_received_with_thanks")}
            </p>

            <div className="grid grid-cols-1 gap-2 bg-white/80 p-4 rounded-lg border border-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="font-bold text-slate-700 min-w-32">
                  {t("donor_name")}:
                </span>
                <span className="text-base font-bold text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                  {donation.donor_name}
                  {donation.donor_name_mr ? ` (${donation.donor_name_mr})` : ""}
                </span>
              </div>

              {donation.address && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-xs">
                  <span className="font-semibold text-slate-600 min-w-32">
                    {t("address")}:
                  </span>
                  <span className="text-slate-800 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                    {donation.address}
                  </span>
                </div>
              )}

              {donation.contact_number && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-xs">
                  <span className="font-semibold text-slate-600 min-w-32">
                    {t("contact_number")}:
                  </span>
                  <span className="text-slate-800 font-mono">
                    {donation.contact_number}
                  </span>
                </div>
              )}
            </div>

            {/* Financial Details Table */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-[11px] uppercase font-bold text-slate-600 block">
                  {t("amount_pledged")}
                </span>
                <span className="text-base font-bold text-slate-800 font-mono">
                  ₹{donation.amount_pledged.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-300">
                <span className="text-[11px] uppercase font-bold text-emerald-800 block">
                  {t("amount_paid")} (जमा)
                </span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  ₹{donation.amount_paid.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-[11px] uppercase font-bold text-slate-600 block">
                  {t("balance_pending")} (शिल्लक)
                </span>
                <span
                  className={`text-base font-bold font-mono ${
                    donation.balance_pending > 0 ? "text-amber-700" : "text-slate-500"
                  }`}
                >
                  ₹{donation.balance_pending.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 px-1">
              <span>
                <strong>{t("payment_mode")}:</strong>{" "}
                <span className="capitalize font-semibold text-slate-800">
                  {donation.payment_mode.replace("_", " ")}
                </span>
              </span>
              {donation.notes && (
                <span className="italic max-w-xs truncate">
                  <strong>नोंद:</strong> {donation.notes}
                </span>
              )}
            </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-8 pt-6 border-t border-dashed border-amber-800/40 flex items-end justify-between font-sans text-xs">
            <div>
              <p className="text-slate-500">
                पावती देणारा: {donation.received_by_name || "मंडळ प्रतिनिधी"}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                कंप्युटर व्युत्पन्न अधिकृत डिजिटल पावती
              </p>
            </div>
            <div className="text-center">
              <div className="h-10 border-b border-slate-400 w-44 mb-1"></div>
              <p className="font-bold text-amber-950">{t("receipt_signature")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
