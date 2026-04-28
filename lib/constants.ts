import type { Route } from "next";
import type { InstallStatus, PaymentStatus } from "@/lib/types";

export const installStatusClasses: Record<InstallStatus, string> = {
  "Not Scheduled": "bg-slate-100 text-slate-600",
  "Pending Install": "bg-amber-100 text-amber-800",
  Scheduled: "bg-sky-100 text-sky-800",
  "In Progress": "bg-orange-100 text-orange-800",
  Installed: "bg-emerald-100 text-emerald-800",
  Delayed: "bg-rose-100 text-rose-800",
  "Repair Needed": "bg-rose-100 text-rose-800",
  Completed: "bg-emerald-100 text-emerald-800",
};

export const paymentStatusClasses: Record<PaymentStatus, string> = {
  "Deposit Pending": "bg-amber-100 text-amber-800",
  "Deposit Scheduled": "bg-sky-100 text-sky-800",
  "Deposit Collected": "bg-emerald-100 text-emerald-800",
  "Final Payment Owed": "bg-rose-100 text-rose-800",
  "Paid in Full": "bg-emerald-100 text-emerald-800",
};

export const navigation: Array<{ href: Route; label: string; description: string }> = [
  { href: "/jobs", label: "Jobs", description: "Track and manage work orders in one place." },
  { href: "/calendar", label: "Calendar", description: "View scheduled installs and move jobs by date." },
  { href: "/dashboard", label: "Dashboard", description: "Daily pipeline and dial activity." },
  { href: "/pipelines", label: "Pipelines", description: "Drag leads across custom stages." },
  { href: "/dialer", label: "Dialer", description: "Run scripts, rotate leads, and log outcomes." },
  { href: "/settings", label: "Settings", description: "Control cards, templates, scripts, and imports." },
];
