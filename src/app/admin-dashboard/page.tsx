"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import InvoiceAnalytics from "@/components/admin/invoice-analytics";
import UserManagement from "@/components/admin/usermanagement";
import SubscriptionPlans from "@/components/admin/SubscriptionPlans";

export default function AdminDashboardPage() {
  const [view, setView] = useState<"home" | "users" | "plans">("home");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Get the view from URL after component mounts
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      if (viewParam === 'users') {
        setView('users');
      } else if (viewParam === 'plans') {
        setView('plans');
      } else {
        setView('home');
      }
    }
  }, []);

  // Show loading until component is mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 transition-all duration-300">
          <div className="container mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-center p-8">
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

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

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';