"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useRouter } from "next/navigation";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (!data.user || data.user.role !== "super_admin") {
          router.push("/login");
        } else {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Sidebar
        userRole="super_admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mandalName="Super Admin Portal"
      />

      <div className="lg:pl-68 flex-1 flex flex-col min-w-0">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          userName={user?.name || "Rameshwar Patil"}
          userRole="super_admin"
          mandalName="Central Mandal Command"
          mandalNameMr="केंद्रीय मंडळ नियंत्रण कक्ष"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
