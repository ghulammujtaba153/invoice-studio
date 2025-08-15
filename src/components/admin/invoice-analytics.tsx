"use client";

import React, { useMemo, useState } from "react";
import type { ProcessedInvoice } from "@/types/invoice";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

/* ------------------------------ DEMO DATA ------------------------------ */

const makeDemo = (i: number, date: string, vendor: string, subtotal: number): ProcessedInvoice => {
  const vat = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + vat).toFixed(2);
  return {
    id: `demo_${i}`,
    file: null as any,
    fileName: `Demo Invoice ${i}`,
    fileSize: 0,
    fileType: "application/json",
    status: "completed",
    extractedData: {
      invoice_date: date,
      invoice_number: `INV-${date.replace(/-/g, "")}-${i}`,
      trn_number: `TRN${1000 + i}`,
      vendor_name: vendor,
      total_before_tax: String(subtotal),
      vat_amount: String(vat),
      total_amount: String(total),
    },
    processingOrderIndex: i,
  };
};

// 14 demo invoices across months/vendors
const DEMO_INVOICES_COMPLETED: ProcessedInvoice[] = [
  makeDemo(1,  "2025-01-12", "Alpha Supplies", 1800),
  makeDemo(2,  "2025-01-25", "Gamma Office",   2400),
  makeDemo(3,  "2025-02-08", "Beta Traders",   1200),
  makeDemo(4,  "2025-02-22", "Delta Telecom",  3100),
  makeDemo(5,  "2025-03-05", "Alpha Supplies", 2200),
  makeDemo(6,  "2025-03-19", "Orion Foods",    1600),
  makeDemo(7,  "2025-04-11", "Gamma Office",   2800),
  makeDemo(8,  "2025-05-03", "Beta Traders",   1950),
  makeDemo(9,  "2025-05-28", "Delta Telecom",  3300),
  makeDemo(10, "2025-06-10", "Alpha Supplies", 2550),
  makeDemo(11, "2025-06-21", "Orion Foods",    1400),
  makeDemo(12, "2025-07-07", "Gamma Office",   2900),
  makeDemo(13, "2025-07-26", "Beta Traders",   2100),
  makeDemo(14, "2025-08-09", "Delta Telecom",  3700),
];

/* ------------------------------ helpers ------------------------------ */

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const numberFromMoney = (val?: string) => {
  if (!val) return 0;
  const n = parseFloat(val.replace(/[^0-9.-]+/g, ""));
  return isNaN(n) ? 0 : n;
};

const safeDate = (dateStr?: string) => {
  if (!dateStr) return null;
  // ISO first
  const iso = new Date(dateStr);
  if (!isNaN(iso.getTime())) return iso;

  // Try DD-MM-YYYY
  const m1 = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m1) return new Date(Date.UTC(+m1[3], +m1[2] - 1, +m1[1]));

  // Try DD/MM/YYYY
  const m2 = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m2) return new Date(Date.UTC(+m2[3], +m2[2] - 1, +m2[1]));

  return null;
};

const fmtCompact = (n: number) =>
  Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

/* ------------------------------ theme mapping ------------------------------ */

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--chart-1,221 83% 53%))",
  "hsl(var(--chart-2,12 76% 61%))",
  "hsl(var(--chart-3,142 71% 45%))",
  "hsl(var(--chart-4,45 93% 47%))",
  "hsl(var(--chart-5,291 70% 50%))",
  "hsl(var(--chart-6,199 89% 48%))",
];

const UI = {
  text: "hsl(var(--muted-foreground))",
  grid: "hsl(var(--border))",
  popoverBg: "hsl(var(--popover))",
  popoverFg: "hsl(var(--popover-foreground))",
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
};

/* ------------------------------ component ------------------------------ */

type Props = { invoices: ProcessedInvoice[] };

export default function InvoiceAnalytics({ invoices }: Props) {
  const [monthsBack, setMonthsBack] = useState<number>(12);
  const hasReal =
    invoices?.some((i) => i.status === "completed" && i.extractedData) ?? false;

  // Use real invoices if present; otherwise fall back to demo
  const sourceInvoices = hasReal ? invoices : DEMO_INVOICES_COMPLETED;

  // Normalize to rows
  const rows = useMemo(() => {
    return sourceInvoices
      .filter((i) => i.status === "completed" && i.extractedData)
      .map((i) => {
        const d = i.extractedData!;
        const dt = safeDate(d.invoice_date);
        return {
          date: dt,
          monthKey: dt ? `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}` : "Unknown",
          vendor: (d.vendor_name || "Unknown").trim() || "Unknown",
          number: d.invoice_number || "",
          subtotal: numberFromMoney(d.total_before_tax),
          vat: numberFromMoney(d.vat_amount),
          total: numberFromMoney(d.total_amount),
        };
      });
  }, [sourceInvoices]);

  // Filter by monthsBack relative to the latest date we have
  const filtered = useMemo(() => {
    if (rows.length === 0) return rows;
    const latestTs = rows
      .filter((r) => r.date)
      .map((r) => r.date!.getTime())
      .sort((a, b) => b - a)[0];
    if (!latestTs) return rows;

    const latest = new Date(latestTs);
    const gate = new Date(Date.UTC(latest.getUTCFullYear(), latest.getUTCMonth() - (monthsBack - 1), 1));
    return rows.filter((r) => !r.date || r.date >= gate);
  }, [rows, monthsBack]);

  // KPIs
  const kpis = useMemo(() => {
    const invCount = filtered.length;
    const totalAmount = sum(filtered.map((r) => r.total));
    const totalVat = sum(filtered.map((r) => r.vat));
    const avgInvoice = invCount ? totalAmount / invCount : 0;
    return { invCount, totalAmount, totalVat, avgInvoice };
  }, [filtered]);

  // Monthly totals
  const byMonth = useMemo(() => {
    const map = new Map<string, { month: string; total: number; vat: number; subtotal: number }>();
    filtered.forEach((r) => {
      const key = r.monthKey;
      const obj = map.get(key) || { month: key, total: 0, vat: 0, subtotal: 0 };
      obj.total += r.total;
      obj.vat += r.vat;
      obj.subtotal += r.subtotal;
      map.set(key, obj);
    });
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  // Vendor share
  const byVendor = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => map.set(r.vendor, (map.get(r.vendor) || 0) + r.total));
    const arr = Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
    const top = arr.slice(0, 8);
    const other = arr.slice(8);
    if (other.length) top.push({ name: "Others", total: sum(other.map((o) => o.total)) });
    return top;
  }, [filtered]);

  // Subtotal vs VAT monthly
  const flows = useMemo(
    () => byMonth.map((m) => ({ month: m.month, Subtotal: m.subtotal, VAT: m.vat })),
    [byMonth]
  );

  // Cumulative total
  const running = useMemo(() => {
    let acc = 0;
    return byMonth.map((m) => {
      acc += m.total;
      return { month: m.month, Cumulative: acc };
    });
  }, [byMonth]);

  const exportCsv = () => {
    const header = ["Date", "Vendor", "Invoice No", "Subtotal", "VAT", "Total"];
    const lines = filtered.map((r) => [
      r.date ? r.date.toISOString().split("T")[0] : "",
      (r.vendor || "").replaceAll(",", " "),
      (r.number || "").replaceAll(",", " "),
      r.subtotal,
      r.vat,
      r.total,
    ]);
    const csv = [header, ...lines].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const EmptyState = ({ label }: { label: string }) => (
    <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">{label}</div>
  );

  /* -------------------------------- render -------------------------------- */

  return (
    <div className="space-y-6">
      {/* Header + range control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">
          Analytics Overview {hasReal ? "" : "(Demo Data)"}
        </h2>
        <div className="flex items-center gap-2">
          {[3, 6, 12, 24].map((m) => (
            <Button
              key={m}
              variant="outline"
              onClick={() => setMonthsBack(m)}
              className={cx(monthsBack === m && "border-primary text-primary")}
            >
              {m}M
            </Button>
          ))}
          <Button onClick={exportCsv} className="ml-2">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Invoices</div>
          <div className="text-2xl font-bold">{kpis.invCount}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Total Amount</div>
          <div className="text-2xl font-bold">{fmtCompact(kpis.totalAmount)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Total VAT</div>
          <div className="text-2xl font-bold">{fmtCompact(kpis.totalVat)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Avg. Invoice</div>
          <div className="text-2xl font-bold">{fmtCompact(kpis.avgInvoice)}</div>
        </Card>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly totals */}
        <Card className="p-5">
          <div className="mb-3 font-medium">Monthly Total Amount</div>
          {byMonth.length === 0 ? (
            <EmptyState label="No invoice data yet. Upload & process invoices to see charts." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMonth}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      color: "hsl(var(--popover-foreground))",
                      border: `1px solid hsl(var(--border))`,
                    }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                  <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Vendor share */}
        <Card className="p-5">
          <div className="mb-3 font-medium">Vendor Share (by Total)</div>
          {byVendor.length === 0 ? (
            <EmptyState label="No vendor data yet." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byVendor}
                    dataKey="total"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                    label
                  >
                    {byVendor.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      color: "hsl(var(--popover-foreground))",
                      border: `1px solid hsl(var(--border))`,
                    }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Subtotal vs VAT */}
        <Card className="p-5">
          <div className="mb-3 font-medium">Subtotal vs VAT (Monthly)</div>
          {flows.length === 0 ? (
            <EmptyState label="No monthly flow data yet." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={flows}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      color: "hsl(var(--popover-foreground))",
                      border: `1px solid hsl(var(--border))`,
                    }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                  <Area type="monotone" dataKey="Subtotal" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="VAT" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Cumulative */}
        <Card className="p-5">
          <div className="mb-3 font-medium">Cumulative Total</div>
          {running.length === 0 ? (
            <EmptyState label="No cumulative data yet." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={running}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      color: "hsl(var(--popover-foreground))",
                      border: `1px solid hsl(var(--border))`,
                    }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                  <Line type="monotone" dataKey="Cumulative" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
