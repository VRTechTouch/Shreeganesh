import type { Metadata } from "next";
import { I18nProvider } from "@/i18n/I18nContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "गणपती मंडळ पोर्टल | Ganpati Mandal Festival Management",
  description:
    "Comprehensive multi-tenant festival committee management portal for Ganpati Mandals. Vargani donations, daily expenses, member directory & bilingual reporting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-slate-50 text-slate-900">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
