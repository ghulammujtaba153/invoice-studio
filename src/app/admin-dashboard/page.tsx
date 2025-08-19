"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import InvoiceAnalytics from "@/components/admin/invoice-analytics";
import UserManagement from "@/components/admin/usermanagement";
import SubscriptionPlans from "@/components/admin/SubscriptionPlans";

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
            <section className="mt-4">
              <InvoiceAnalytics invoices={[]} />
            </section>
          ) : view === "users" ? (
            <section className="mt-4">
              <UserManagement />
            </section>
          ) : (
            <section className="mt-4">
              <SubscriptionPlans />
            </section>
          )}
        </div>

        <footer className="text-center py-10 text-muted-foreground text-base mt-auto">
          <p>
            &copy; {new Date().getFullYear()} Invoice Insights. AI-Powered Data
            Extraction.
          </p>
        </footer>
      </div>
    </div>
  );
}
