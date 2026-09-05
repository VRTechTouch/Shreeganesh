"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mandal, setMandal] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (!data.user) {
          router.push("/login");
        } else {
          setUser(data.user);
          setMandal(data.mandal);
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Sidebar
        userRole={user?.role}
        userPermissions={user?.permissions || []}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mandalName={mandal?.name}
      />

      <div className="lg:pl-68 flex-1 flex flex-col min-w-0">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          userName={user?.name || "User"}
          userRole={user?.role || "mandal_admin"}
          mandalName={mandal?.name}
          mandalNameMr={mandal?.name_mr}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
