"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import InvoiceAnalytics from "@/components/admin/invoice-analytics";
import UserManagement from "@/components/admin/usermanagement";

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") || "home") as "home" | "users";

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (left) */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 transition-all duration-300">
        <div className="container mx-auto p-4 md:p-8 space-y-6">
          {/* <Header /> */}

          {view === "home" ? (
            // Graphs & Charts
            <section className="mt-4">
              {/* Pass empty array; InvoiceAnalytics will auto-fallback to demo data */}
              <InvoiceAnalytics invoices={[]} />
            </section>
          ) : (
            // User Management (table + modals)
            <section className="mt-4">
              <UserManagement />
            </section>
          )}
        </div>

        <footer className="text-center py-10 text-muted-foreground text-base mt-auto">
          <p>&copy; {new Date().getFullYear()} Invoice Insights. AI-Powered Data Extraction.</p>
        </footer>
      </div>
    </div>
  );
}
